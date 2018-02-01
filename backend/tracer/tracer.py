import multiprocessing
import queue
import sys
import threading
import traceback
from functools import reduce


class Tracer:

    def __init__(self, script, input_callback, print_callback):
        self._script = script
        self._script_lines = script.splitlines()
        self._input_callback = input_callback
        self._print_callback = print_callback
        self._ended = False
        self._info_main_to_sub_queue = multiprocessing.Queue()
        self._info_sub_to_main_queue = multiprocessing.Queue()
        self._io_main_to_sub_queue = multiprocessing.Queue()
        self._io_sub_to_main_queue = multiprocessing.Queue()
        self._tracer_subprocess = multiprocessing.Process(
            target=_start_tracer_subprocess,
            args=(
                self._script,
                self._info_main_to_sub_queue, self._info_sub_to_main_queue,
                self._io_main_to_sub_queue, self._io_sub_to_main_queue
            )
        )
        self._tracer_subprocess.start()
        self._tracer_io_thread = threading.Thread(target=self._start_io, args=())
        self._tracer_io_thread.start()

    def next_info(self):
        if self._ended or not self._tracer_subprocess.is_alive():
            raise Exception('tracer ended')
        self._info_main_to_sub_queue.put('next')
        info = self._info_sub_to_main_queue.get()
        if info['end']:
            self._ended = True
        return info

    def _stop(self):
        if self._ended or not self._tracer_subprocess.is_alive():
            raise Exception('tracer ended')
        self._info_main_to_sub_queue.put('quit')
        return self._info_sub_to_main_queue.get() == 'quit'

    def _start_io(self):
        timeout = 0.01
        while self._tracer_subprocess.is_alive():
            try:
                io_action, value = self._io_sub_to_main_queue.get(timeout=timeout)
                if io_action == 'input':
                    expected = self._input_callback(value)
                    self._io_main_to_sub_queue.put(expected)
                elif io_action == 'print':
                    self._print_callback(value)
            except queue.Empty:
                pass


class CompressedTracer(Tracer):

    def __init__(self, script, input_callback, print_callback):
        super().__init__(script, input_callback, print_callback)
        self.saved_info = None

    def next_info(self):
        if self._ended or not self._tracer_subprocess.is_alive():
            raise Exception('tracer ended')
        while True:
            self._info_main_to_sub_queue.put('next')
            info = self._info_sub_to_main_queue.get()
            if info['end']:
                self._ended = True
                return info
            if info['filename'] != '<string>':
                continue
            if self.saved_info is None:
                self.saved_info = info
            else:
                if info['line'] == self.saved_info['line']:
                    self.saved_info = info
                else:
                    final_info = self.saved_info
                    self.saved_info = info
                    return final_info
        return info
    

# everything below run in other process

def _start_tracer_subprocess(script, info_main_to_sub_queue, info_sub_to_main_queue,
                             io_main_to_sub_queue, io_sub_to_main_queue):
    _SubprocessTracer(
        script,
        info_main_to_sub_queue, info_sub_to_main_queue,
        io_main_to_sub_queue, io_sub_to_main_queue
    )


class SubprocessInput:

    def __init__(self, io_main_to_sub_queue, io_sub_to_main_queue):
        self.io_main_to_sub_queue = io_main_to_sub_queue
        self.io_sub_to_main_queue = io_sub_to_main_queue

    def __call__(self, prompt=''):
        prompt = str(prompt)
        self.io_sub_to_main_queue.put(('input', prompt))
        return self.io_main_to_sub_queue.get()


class SubprocessPrint:

    def __init__(self, io_main_to_sub_queue, io_sub_to_main_queue):
        self.io_main_to_sub_queue = io_main_to_sub_queue
        self.io_sub_to_main_queue = io_sub_to_main_queue

    def __call__(self, *values, sep=None, end=None):
        if sep is not None and type(sep) is not str:
            raise TypeError(f'sep must be None or a string, not {type(end)}')
        sep = sep if sep is not None else ' '
        if end is not None and type(end) is not str:
            raise TypeError(f'end must be None or a string, not {type(end)}')
        end = end if end is not None else '\n'
        values = values if len(values) > 0 else ('',)
        text = reduce((lambda e0, e1: e0 + sep + e1), map((lambda e: str(e)), values)) + end
        self.io_sub_to_main_queue.put(('print', text))


def subprocess_disable_modules(modules):
    sys = __import__('sys')
    for module in sys.modules:
        if module in modules:
            sys.modules[module] = None


class DisabledFunction:

    def __init__(self, function_name):
        self.function_name = function_name

    def __call__(self, *args, **kwargs):
        raise Exception(f'function {self.function_name} is disabled!!')


def subprocess_disable_functions(functions, globals_data=globals()):
    for f in functions:
        globals_data['__builtins__'][f] = DisabledFunction(f)


COMMON_DISABLE_MODULES = {
    'sys', '_frozen_importlib', '_imp', '_warnings', '_thread', '_weakref',
    '_frozen_importlib_external', '_io', 'marshal', 'nt', 'winreg', 'zipimport', 'encodings',
    'codecs', '_codecs', 'encodings.aliases', 'encodings.utf_8', '_signal', '__main__',
    'encodings.latin_1', 'io', 'abc', '_weakrefset', 'site', 'os', 'errno', 'stat', '_stat',
    'ntpath', 'genericpath', 'os.path', '_collections_abc', '_sitebuiltins', 'sysconfig',
    'atexit, multiprocessing, threading'
}


COMMON_DISABLE_FUNCTIONS = {'compile', 'exec'}


class _SubprocessTracer:

    def __init__(self, script, info_main_to_sub_queue, info_sub_to_main_queue,
                 io_main_to_sub_queue, io_sub_to_main_queue):
        self.script = script
        self.script_lines = script.splitlines()
        self.info_main_to_sub_queue = info_main_to_sub_queue
        self.info_sub_to_main_queue = info_sub_to_main_queue
        self.io_main_to_sub_queue = io_main_to_sub_queue
        self.io_sub_to_main_queue = io_sub_to_main_queue
        self.bot_frame = None
        self.start()

    def start(self):
        #
        compile_backup = compile
        exec_backup = exec
        #
        script_globals = {
            '__name__': '__main__',
            '__file__': '<script>',
            '__doc__': None,
            '__package__': None,
            '__loader__': None,
            '__spec__': None,
            '__cached__': None,
            '__builtins__': globals()['__builtins__'].copy()
        }
        script_globals['__builtins__']['input'] = SubprocessInput(
            self.io_main_to_sub_queue, self.io_sub_to_main_queue
        )
        script_globals['__builtins__']['print'] = SubprocessPrint(
            self.io_main_to_sub_queue, self.io_sub_to_main_queue
        )
        subprocess_disable_modules(COMMON_DISABLE_MODULES)
        subprocess_disable_functions(COMMON_DISABLE_FUNCTIONS, script_globals)
        #
        sys.settrace(self.trace_dispatch)
        try:
            compiled_script = compile_backup(self.script, '<string>', 'exec')
            exec_backup(compiled_script, script_globals)
        except Exception:
            pass
        finally:
            sys.settrace(None)

    def trace_dispatch(self, frame, event, args):
        action = self.info_main_to_sub_queue.get()
        if action == 'next':
            if self.bot_frame is None:
                self.bot_frame = frame
            self.info_sub_to_main_queue.put(self.get_frame_data(frame, event, args))
            return self.trace_dispatch
        elif action == 'quit':
            self.info_sub_to_main_queue.put('quit')
            return None

    def get_frame_data(self, frame, event, args):
        filename = frame.f_code.co_filename
        line = frame.f_lineno - 1
        text = self.script_lines[line] if filename == '<string>' else '#'
        stack, depth = self.get_stack(frame)
        end = event == 'return' and depth <= 1

        if event == 'exception':
            # tracebacks (args[2]) are not 'picklable'
            args = (
                args[0],
                args[1],
                traceback.format_exception(args[0], args[1], args[2]))

        return {
            'event': event,
            'args': args if filename == '<string>' else [],
            'filename': filename,
            'line': line,
            'stack': stack,
            'depth': depth,
            'text': text,
            'end': end}

    def get_stack(self, frame):
        stack = []
        while frame is not None:
            filename = frame.f_code.co_filename
            line = frame.f_lineno - 1
            text = self.script_lines[line] if filename == '<string>' else '#'
            stack.append({
                'filename': filename,
                'line': line,
                'text': text}),
            if frame is self.bot_frame:
                break
            frame = frame.f_back
        stack.reverse()
        i = max(0, len(stack))
        return stack, i


################################
def main():
    script = '''

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

x = int(input('x value: '))
print(f'x: {x}')
y = int(input('y value: '))
print(f'y: {y}')
z = int(input('z value: '))
print(f'z: {z}')

v = XYZ(x, y, z)
sm = v.sqr_mag()
print(f'sqr_mag of {v} is {sm}')

raise 'error'

'''

    def input_callback(prompt):
        return input(prompt)

    def print_callback(text):
        print(text, end='')

    t = CompressedTracer(script, input_callback, print_callback)
    while True:
        try:
            info = t.next_info()
            print(info['text'])
        except Exception:
            break


if __name__ == '__main__':
    main()
