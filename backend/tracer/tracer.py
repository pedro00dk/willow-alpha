class Tracer:
    mp = __import__('multiprocessing')
    queue = __import__('queue')
    th = __import__('threading')

    def __init__(self, script, input_callback, print_callback):
        self._script = script
        self._script_lines = script.splitlines()
        self._input_callback = input_callback
        self._print_callback = print_callback
        self._ended = False

        self._info_main_to_sub_queue = Tracer.mp.Queue()
        self._info_sub_to_main_queue = Tracer.mp.Queue()
        self._io_main_to_sub_queue = Tracer.mp.Queue()
        self._io_sub_to_main_queue = Tracer.mp.Queue()
        self._tracer_subprocess = Tracer.mp.Process(
            target=_start_tracer_subprocess,
            args=(
                self._script,
                self._info_main_to_sub_queue, self._info_sub_to_main_queue,
                self._io_main_to_sub_queue, self._io_sub_to_main_queue))
        self._tracer_subprocess.start()

        self._tracer_io_thread = Tracer.th.Thread(target=self._start_io, args=())
        self._tracer_io_thread.start()

    def next_info(self):
        if self._ended:
            raise Exception('tracer ended')
        self._info_main_to_sub_queue.put('next')
        info = self._info_sub_to_main_queue.get()
        if info['end']:
            self._ended = True
        return info

    def _start_io(self):
        timeout = 0.001
        while self._tracer_subprocess.is_alive():
            try:
                io_action = self._io_sub_to_main_queue.get(timeout=timeout)
                if io_action == 'input':
                    prompt = self._io_sub_to_main_queue.get()
                    expected = self._input_callback(prompt)
                    self._io_main_to_sub_queue.put(expected)
                elif io_action == 'print':
                    text = self._io_sub_to_main_queue.get()
                    self._print_callback(text)
            except Tracer.queue.Empty:
                pass


# everything below run in other process

def _start_tracer_subprocess(script, info_main_to_sub_queue, info_sub_to_main_queue,
                             io_main_to_sub_queue, io_sub_to_main_queue):
    _SubprocessTracer(
        script,
        info_main_to_sub_queue, info_sub_to_main_queue,
        io_main_to_sub_queue, io_sub_to_main_queue)


class _SubprocessTracer:
    sys = __import__('sys')
    tb = __import__('traceback')
    util = __import__('util')

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
            '__name__': '__ma_in__',
            '__file__': '<script>',
            '__doc__': None,
            '__package__': None,
            '__loader__': None,
            '__spec__': None,
            '__cached__': None,
            '__builtins__': globals()['__builtins__'].copy()
        }
        script_globals['__builtins__']['input'] = _SubprocessTracer.util.SubprocessInput(
            self.io_main_to_sub_queue, self.io_sub_to_main_queue)
        script_globals['__builtins__']['print'] = _SubprocessTracer.util.SubprocessPrint(
            self.io_main_to_sub_queue, self.io_sub_to_main_queue)
        _SubprocessTracer.util.subprocess_disable_modules(
            _SubprocessTracer.util.COMMON_DISABLE_MODULES)
        _SubprocessTracer.util.subprocess_disable_functions(
            _SubprocessTracer.util.COMMON_DISABLE_FUNCTIONS, script_globals)
        #
        _SubprocessTracer.sys.settrace(self.trace_dispatch)
        try:
            compiled_script = compile_backup(self.script, '<string>', 'exec')
            exec_backup(compiled_script, script_globals)
        except Exception:
            pass
        finally:
            _SubprocessTracer.sys.settrace(None)

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
                _SubprocessTracer.tb.format_exception(args[0], args[1], args[2]))

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

    '''
raise Exception()
'''
    '''
print(print)
'''
    script = '''
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
        print(text)

    t = Tracer(script, input_callback, print_callback)
    while True:
        try:
            t.next_info()
        except Exception:
            break


if __name__ == '__main__':
    main()
