import queue
import multiprocessing
import sys
import traceback
from functools import reduce


_ACTION_NEXT = 'next'
_ACTION_QUIT = 'quit'

_EVENT_FRAME = 'frame'
_EVENT_INPUT = 'input'
_EVENT_PRINT = 'print'
_EVENT_QUIT = 'quit'

_FRAME_CALL = 'call'
_FRAME_LINE = 'line'
_FRAME_EXCEPTION = 'exception'
_FRAME_RETURN = 'return'
_FRAME_EVENTS = {_FRAME_CALL, _FRAME_LINE, _FRAME_EXCEPTION, _FRAME_RETURN}

_SCRIPT_NAME = '<string>'


class _Input:

    def __init__(self, main_to_sub_queue, sub_to_main_queue):
        self.main_to_sub_queue = main_to_sub_queue
        self.sub_to_main_queue = sub_to_main_queue

    def __call__(self, prompt=''):
        prompt = str(prompt)
        self.sub_to_main_queue.put((_EVENT_INPUT, prompt))
        return self.main_to_sub_queue.get()


class _Print:

    def __init__(self, main_to_sub_queue, sub_to_main_queue):
        self.main_to_sub_queue = main_to_sub_queue
        self.sub_to_main_queue = sub_to_main_queue

    def __call__(self, *values, sep=None, end=None):
        if sep is not None and type(sep) is not str:
            raise TypeError(f'sep must be None or a string, not {type(end)}')
        sep = sep if sep is not None else ' '
        if end is not None and type(end) is not str:
            raise TypeError(f'end must be None or a string, not {type(end)}')
        end = end if end is not None else '\n'
        values = values if len(values) > 0 else ('',)
        text = reduce((lambda e0, e1: e0 + sep + e1), map((lambda e: str(e)), values)) + end
        self.sub_to_main_queue.put((_EVENT_PRINT, text))


class _DisabledFunction:

    def __init__(self, function_name):
        self.function_name = function_name

    def __call__(self, *args, **kwargs):
        raise Exception(f'function {self.function_name} is disabled!!')


def _disable_functions(functions, globals_data=globals()):
    for f in functions:
        globals_data['__builtins__'][f] = _DisabledFunction(f)


def _disable_modules(modules):
    sys_module = __import__('sys')
    for module in sys.modules:
        if module in modules:
            sys_module.modules[module] = None


_COMMON_DISABLE_FUNCTIONS = {'compile', 'exec'}
_COMMON_DISABLE_MODULES = {
    'sys', '_frozen_importlib', '_imp', '_warnings', '_thread', '_weakref',
    '_frozen_importlib_external', '_io', 'marshal', 'nt', 'winreg', 'zipimport', 'encodings',
    'codecs', '_codecs', 'encodings.aliases', 'encodings.utf_8', '_signal', '__main__',
    'encodings.latin_1', 'io', 'abc', '_weakrefset', 'site', 'os', 'errno', 'stat', '_stat',
    'ntpath', 'genericpath', 'os.path', '_collections_abc', '_sitebuiltins', 'sysconfig',
    'atexit, multiprocessing, threading'
}


class TracerController:

    def __init__(self, script):
        self._script = script
        self._script_lines = script.splitlines()
        self._main_to_sub_queue = multiprocessing.Queue()
        self._sub_to_main_queue = multiprocessing.Queue()
        self._io_main_to_sub_queue = multiprocessing.Queue()
        self._io_sub_to_main_queue = multiprocessing.Queue()
        self._tracer_subprocess = multiprocessing.Process(
            target=_start_tracer_process,
            args=(
                self._script,
                self._main_to_sub_queue, self._sub_to_main_queue,
                self._io_main_to_sub_queue, self._io_sub_to_main_queue
            )
        )
        self._tracer_subprocess.start()
        self._previous_event = _EVENT_FRAME
        self._input_count = 0
        self._tracer_ended = False

    def _require_tracer_running(self):
        if self._tracer_ended:
            raise Exception('tracer ended')

    def _check_required_input(self):
        if self._previous_event == _EVENT_INPUT and self._input_count == 0:
            raise Exception('input required')

    def next_event(self):
        self._require_tracer_running()
        self._check_required_input()
        if self._previous_event == _EVENT_FRAME:
            self._main_to_sub_queue.put(_ACTION_NEXT)
            while True:
                try:
                    event, value = self._io_sub_to_main_queue.get_nowait()
                    break
                except queue.Empty:
                    pass
                try:
                    event, value = self._sub_to_main_queue.get_nowait()
                    break
                except queue.Empty:
                    pass
            self._previous_event = event
            if event == _EVENT_FRAME:
                self._tracer_ended = value['end']
                if self._tracer_ended:
                    self._tracer_subprocess.join()
        elif self._previous_event == _EVENT_INPUT:
            self._input_count -= 1
            event, value = self._sub_to_main_queue.get()
            self._previous_event = event
        elif self._previous_event == _EVENT_PRINT:
            event, value = self._sub_to_main_queue.get()
            self._previous_event = event
        return event, value

    def send_input(self, value):
        self._require_tracer_running()
        self._io_main_to_sub_queue.put(value)
        self._input_count += 1

    def stop(self):
        self._require_tracer_running()
        if self._previous_event == _EVENT_FRAME:
            self._main_to_sub_queue.put(_ACTION_QUIT)
            event, value = self._sub_to_main_queue.get()
        elif self._previous_event == _EVENT_INPUT or self._previous_event == _EVENT_PRINT:
            event, value = self._sub_to_main_queue.get()
            self._main_to_sub_queue.put(_ACTION_QUIT)
            event, value = self._sub_to_main_queue.get()[0] == _EVENT_QUIT
        self._tracer_ended = True
        self._main_to_sub_queue.close()
        self._sub_to_main_queue.close()
        self._io_main_to_sub_queue.close()
        self._io_sub_to_main_queue.close()
        # the traceback does not stop if the program does not finish, the process should be killed
        self._tracer_subprocess.terminate()
        self._tracer_subprocess.join()


class FilteredTracerController(TracerController):

    def next_event(self):
        while True:
            event, value = super().next_event()
            if self._tracer_ended or event == _EVENT_INPUT or event == _EVENT_PRINT:
                return event, value
            if value['filename'] != _SCRIPT_NAME or value['event'] == _FRAME_CALL \
                    or value['event'] == _FRAME_RETURN:
                continue
            return event, value


class StepTracerController(FilteredTracerController):

    def __init__(self, script):
        super().__init__(script)
        self.current_depth = 1

    def step_into(self):
        event, value = super().next_event()
        if event == _EVENT_FRAME:
            self.current_depth = value['depth']
        return [(event, value)]

    def step_over(self):
        events = []
        while True:
            event, value = self.step_into()[0]
            events.append((event, value))
            if self._tracer_ended \
                    or (event == _EVENT_INPUT and self._input_count == 0) \
                    or (event == _EVENT_FRAME and value['depth'] <= self.current_depth):
                return events

    def step_out(self):
        events = []
        while True:
            event, value = self.step_into()[0]
            events.append((event, value))
            if self._tracer_ended \
                    or (event == _EVENT_INPUT and self._input_count == 0) \
                    or (event == _EVENT_FRAME and value['depth'] < self.current_depth):
                return events

def _start_tracer_process(script, main_to_sub_queue, sub_to_main_queue,
                          io_main_to_sub_queue, io_sub_to_main_queue):
    _TracerProcess(
        script,
        main_to_sub_queue, sub_to_main_queue,
        io_main_to_sub_queue, io_sub_to_main_queue
    )


class _TracerProcess:

    def __init__(self, script, main_to_sub_queue, sub_to_main_queue,
                 io_main_to_sub_queue, io_sub_to_main_queue):
        self.script = script
        self.script_lines = script.splitlines()
        self.main_to_sub_queue = main_to_sub_queue
        self.sub_to_main_queue = sub_to_main_queue
        self.io_main_to_sub_queue = io_main_to_sub_queue
        self.io_sub_to_main_queue = io_sub_to_main_queue
        self.bot_frame = None
        self.quit = False
        self.start()

    def start(self):
        compile_backup = compile
        exec_backup = exec
        script_globals = {
            '__name__': '__main__', '__file__': '<string>', '__doc__': None, '__package__': None,
            '__loader__': None, '__spec__': None, '__cached__': None,
            '__builtins__': globals()['__builtins__'].copy()
        }
        script_globals['__builtins__']['input'] = _Input(
            self.io_main_to_sub_queue, self.io_sub_to_main_queue
        )
        script_globals['__builtins__']['print'] = _Print(
            self.io_main_to_sub_queue, self.io_sub_to_main_queue
        )
        _disable_modules(_COMMON_DISABLE_MODULES)
        _disable_functions(_COMMON_DISABLE_FUNCTIONS, script_globals)
        sys.settrace(self.trace_dispatch)
        try:
            compiled_script = compile_backup(self.script, _SCRIPT_NAME, 'exec')
            exec_backup(compiled_script, script_globals)
        except Exception:
            pass
        finally:
            sys.settrace(None)

    def trace_dispatch(self, frame, event, args):
        if self.quit:
            return None
        if event not in _FRAME_EVENTS:
            return self.trace_dispatch
        action = self.main_to_sub_queue.get()
        if action == _ACTION_NEXT:
            if self.bot_frame is None:
                self.bot_frame = frame
            data = self.get_frame_data(frame, event, args)
            self.sub_to_main_queue.put((_EVENT_FRAME, self.get_frame_data(frame, event, args)))
            return self.trace_dispatch
        elif action == _ACTION_QUIT:
            self.quit = True
            self.sub_to_main_queue.put((_EVENT_QUIT, None))
            return None

    def get_frame_data(self, frame, event, args):
        filename = frame.f_code.co_filename
        line = frame.f_lineno - 1
        text = self.script_lines[line] if filename == _SCRIPT_NAME else '#'
        stack, depth = self.get_stack(frame)
        end = event == _FRAME_RETURN and depth <= 1
        if event == _FRAME_EXCEPTION:
            args = {
                'type': args[0],
                'value': args[1],
                'traceback': traceback.format_exception(args[0], args[1], args[2])
            }
        return {
            'event': event,
            'args': args if filename == _SCRIPT_NAME else None,
            'filename': filename,
            'line': line,
            'stack': stack,
            'depth': depth,
            'text': text,
            'end': end
        }

    def get_stack(self, frame):
        stack = []
        while frame is not None:
            filename = frame.f_code.co_filename
            line = frame.f_lineno - 1
            text = self.script_lines[line] if filename == _SCRIPT_NAME else '#'
            stack.append({
                'filename': filename,
                'line': line,
                'text': text
            }),
            if frame is self.bot_frame:
                break
            frame = frame.f_back
        stack.reverse()
        depth = max(0, len(stack))
        return stack, depth


################################
script = '''
def pow(a=10, b=5):
    return a **b

p = pow(10, 3)

'''


'''

from functools import reduce
try:
    import sys
except Exception as e:
    print(str(e))

class XYZ:

    def __init__(self, x, y, z):
        self.x = x
        self.y = y
        self.z = z

    def sqr_mag(self):
        return x * x + y * y + z * z

    def __str__(self):
        return f'{type(self).__name__}({self.x}, {self.y}, {self.z})'

x = 10
y = 10
z = 10
v = XYZ(x, y, z)
sm = v.sqr_mag()
print(f'sqr_mag of {v} is {sm}')


#for i in range(100000):
#    x = f'{i} sqr_mag of {v} is {sm}'
#    if i % 100 == 0:
#        j = input('input')
#        print(j + ' ' + x)

for i in range(10000):
    if i % 10 == 0:
        pass
        print(([i] * i))




raise 'error'

'''


def main():
    t = StepTracerController(script)
    while True:
        try:
            events = t.step_out()
            for event, value in events:
                if event == _EVENT_FRAME:
                    print(value['event'][:4], end=' ')
                    print(value['depth'], end=' ')
                    print(value['text'])
                    print(value['stack'])
                    print()
                if event == 'print':
                    print(value, end='')
                if event == 'input':
                    t.send_input('some input')
        except Exception as e:
            print(e)
            break


if __name__ == '__main__':
    main()
