import json
import multiprocessing
import queue
import sys
import traceback
from enum import auto, Enum
from functools import reduce

# script name
SCRIPT_NAME = '<script>'

# actions
ACTION_NEXT = 'next'
ACTION_QUIT = 'quit'

# events
# # subprocess
EVENT_START = 'start'
EVENT_ERROR = 'error'
EVENT_FRAME = 'frame'
EVENT_INPUT = 'input'
EVENT_PRINT = 'print'
EVENT_QUIT = 'quit'
# # controller
EVENT_REQUIRE_INPUT = 'require_input'


class TracerController:
    """Tracer controller base class."""

    class State(Enum):
        CREATED = auto()
        RUNNING = auto()
        STOPPED = auto()

    def __init__(self, script):
        self.script = script
        self.main_sub_queue = multiprocessing.Queue()
        self.sub_main_queue = multiprocessing.Queue()
        self.main_sub_io_queue = multiprocessing.Queue()
        self.sub_main_io_queue = multiprocessing.Queue()
        self.tracer_subprocess = multiprocessing.Process(
            target=TracerProcess.start_tracer_process,
            args=(self.script, self.main_sub_queue, self.sub_main_queue, self.main_sub_io_queue, self.sub_main_io_queue)
        )
        self.state = TracerController.State.CREATED
        self.previous_event = EVENT_FRAME
        self.input_count = 0

    def start(self):
        self.require_state(TracerController.State.CREATED)
        self.tracer_subprocess.start()
        response = self.sub_main_queue.get()
        self.main_sub_queue.put(ACTION_NEXT)
        if response['event'] == EVENT_START:
            self.state = TracerController.State.RUNNING
        if response['event'] == EVENT_ERROR:
            self.stop()
        return response

    def stop(self):
        self.require_state(TracerController.State.CREATED, TracerController.State.RUNNING)
        if self.state == TracerController.State.RUNNING:
            if self.previous_event in {EVENT_INPUT, EVENT_PRINT}:
                self.sub_main_queue.get()
            self.main_sub_queue.put(ACTION_QUIT)
            self.sub_main_queue.get()
        self.main_sub_queue.close()
        self.sub_main_queue.close()
        self.main_sub_io_queue.close()
        self.sub_main_io_queue.close()
        self.tracer_subprocess.terminate()
        self.tracer_subprocess.join()
        self.state = TracerController.State.STOPPED

    def next_response(self):
        self.require_state(TracerController.State.RUNNING)
        if self.previous_event == EVENT_INPUT and self.input_count == 0:
            return {'event': EVENT_REQUIRE_INPUT}
        if self.previous_event == EVENT_FRAME:
            self.main_sub_queue.put(ACTION_NEXT)
        while True:
            try:
                response = self.sub_main_io_queue.get_nowait()
                break
            except queue.Empty:
                pass
            try:
                response = self.sub_main_queue.get_nowait()
                break
            except queue.Empty:
                pass
        if self.previous_event == EVENT_INPUT:
            self.input_count -= 1
        self.previous_event = response['event']
        if response['event'] == EVENT_ERROR or (response['event'] == EVENT_FRAME and response['value']['end']):
            self.state = TracerController.State.STOPPED
            self.tracer_subprocess.terminate()
            self.tracer_subprocess.join()
        return response

    def send_input(self, value):
        self.require_state(TracerController.State.RUNNING)
        self.main_sub_io_queue.put(value)
        self.input_count += 1

    def require_state(self, *states):
        if self.state not in states:
            raise Exception('illegal state')


class FilteredTracerController(TracerController):
    """Tracer extension that filters frame call and frame return events."""

    def next_response(self):
        while True:
            response = super().next_response()
            if self.state == TracerController.State.STOPPED or \
                    response['event'] in {EVENT_ERROR, EVENT_REQUIRE_INPUT, EVENT_INPUT, EVENT_PRINT} or \
                    response['value']['event'] in {'line', 'exception'}:
                return response


class StepTracerController(FilteredTracerController):
    """Tracer extension with step support."""

    def __init__(self, script):
        super().__init__(script)
        self.depth = 1

    def next_response(self):
        raise AttributeError('\'StepTracerController\' object has no attribute \'next_response\'')

    def step_into(self):
        response = super().next_response()
        self.depth = response['value']['depth'] if response['event'] == EVENT_FRAME else self.depth
        return [response]

    def step_over(self):
        responses = []
        while True:
            response = super().next_response()
            responses.append(response)
            if self.state == TracerController.State.STOPPED or \
                    response['event'] in {EVENT_ERROR, EVENT_REQUIRE_INPUT} or \
                    (response['event'] == EVENT_INPUT and self.input_count == 0) or \
                    (response['event'] == EVENT_FRAME and response['value']['depth'] <= self.depth):
                self.depth = response['value']['depth'] if response['event'] == EVENT_FRAME else self.depth
                return responses

    def step_out(self):
        responses = []
        while True:
            response = super().next_response()
            responses.append(response)
            if self.state == TracerController.State.STOPPED or \
                    response['event'] in {EVENT_ERROR, EVENT_REQUIRE_INPUT} or \
                    (response['event'] == EVENT_FRAME and response['value']['depth'] < self.depth):
                self.depth = response['value']['depth'] if response['event'] == EVENT_FRAME else self.depth
                return responses


class TracerProcess:
    """Tracer process."""

    class Input:
        """Redirects input as events over process connection queues."""

        def __init__(self, main_to_sub_queue, sub_to_main_queue):
            self.main_to_sub_queue = main_to_sub_queue
            self.sub_to_main_queue = sub_to_main_queue

        def __call__(self, prompt=''):
            prompt = str(prompt)
            self.sub_to_main_queue.put({'event': EVENT_INPUT, 'value': prompt})
            return self.main_to_sub_queue.get()

    class Print:
        """Redirects print as events over process connection queues."""

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
            self.sub_to_main_queue.put({'event': EVENT_PRINT, 'value': text})

    class JSONStrEncoder(json.JSONEncoder):
        """Json encoder that serializes non common objects as str(o)."""

        def default(self, o):
            return str(o)

    @staticmethod
    def allow_only_builtins(allow, glb_cpy):
        glb_cpy['__builtins__'] = {name: bltn for name, bltn in glb_cpy['__builtins__'].items() if name in allow}

    @staticmethod
    def allow_only_modules(allow, sys_mod):
        sys_mod.modules = {name: mod if name in allow else None for name, mod in sys_mod.modules.items()}

    @staticmethod
    def start_tracer_process(script, main_sub_queue, sub_main_queue, main_sub_io_queue, sub_main_io_queue):
        TracerProcess(script, main_sub_queue, sub_main_queue, main_sub_io_queue, sub_main_io_queue)

    def __init__(self, script, main_sub_queue, sub_main_queue, main_sub_io_queue, sub_main_io_queue):
        self.script = script
        self.script_lines = self.script.splitlines() if script != '' else ['']
        self.main_sub_queue = main_sub_queue
        self.sub_main_queue = sub_main_queue
        self.main_sub_io_queue = main_sub_io_queue
        self.sub_main_io_queue = sub_main_io_queue
        self.exec_frame = None
        self.quit = False
        self.start()

    def start(self):
        script_globals = {
            '__name__': '__main__', '__file__': '<string>', '__doc__': None, '__package__': None, '__loader__': None,
            '__spec__': None, '__cached__': None, '__builtins__': vars(globals()['__builtins__']).copy()
        }
        allowed_builtins = {name for name in dir(globals()['__builtins__']) if name not in {'compile', 'exec', 'open'}}
        allowed_modules = {
            'bisect', 'collections', 'copy', 'datetime', 'functools', 'hashlib', 'heapq', 'itertools', 'math',
            'operator', 'random', 're', 'string', 'time', 'typing'
        }
        script_globals['__builtins__']['input'] = TracerProcess.Input(self.main_sub_io_queue, self.sub_main_io_queue)
        script_globals['__builtins__']['print'] = TracerProcess.Print(self.main_sub_io_queue, self.sub_main_io_queue)
        TracerProcess.allow_only_builtins(allowed_builtins, script_globals)
        TracerProcess.allow_only_modules(allowed_modules, sys)
        try:
            compiled = compile(self.script, SCRIPT_NAME, 'exec')
            self.sub_main_queue.put({'event': EVENT_START})
            self.main_sub_queue.get()
            sys.settrace(self.trace_dispatch)
            exec(compiled, script_globals)
        except Exception as e:
            self.sub_main_queue.put({
                'event': EVENT_ERROR,
                'value': {
                    'type': str(type(e)), 'value': e.args, 'tb': traceback.format_exception(type(e), e, e.__traceback__)
                },
            })
            self.main_sub_queue.get()
        finally:
            sys.settrace(None)

    def trace_dispatch(self, frame, event, args):
        if self.quit:
            return None
        if frame.f_code.co_filename != SCRIPT_NAME or event not in {'call', 'line', 'exception', 'return'}:
            return self.trace_dispatch
        action = self.main_sub_queue.get()
        if action == ACTION_NEXT:
            self.exec_frame = frame.f_back if self.exec_frame is None else self.exec_frame
            self.sub_main_queue.put({'event': EVENT_FRAME, 'value': self.get_frame_data(frame, event, args)})
            return self.trace_dispatch
        if action == ACTION_QUIT:
            self.quit = True
            self.sub_main_queue.put({'event': EVENT_QUIT})
            return None

    def get_frame_data(self, frame, event, args):
        line = frame.f_lineno - 1
        text = self.script_lines[line]
        stack, depth = self.get_stack(frame)
        args = {'type': str(args[0]), 'value': args[1].args, 'tb': traceback.format_exception(*args)} \
            if event == 'exception' else args
        end = event == 'return' and depth <= 1
        return {
            'event': event, 'line': line, 'text': text, 'stack': stack, 'depth': depth, 'args': args, 'end': end,
            'locals': json.dumps(self.build_locals_graph(frame), cls=TracerProcess.JSONStrEncoder)
        }

    def get_stack(self, frame):
        stack = []
        while frame != self.exec_frame:
            if frame.f_code.co_filename != SCRIPT_NAME:
                frame = frame.f_back
                continue
            line = frame.f_lineno - 1
            text = self.script_lines[line]
            stack.append({'line': line, 'text': text})
            frame = frame.f_back
        depth = max(0, len(stack))
        return stack, depth

    def build_locals_graph(self, frame):
        frame_locals = frame.f_locals
        objects = {}
        user_classes = set()
        variables = {name: self.walk_object(frame_locals[name], objects, user_classes)
                     for name, value in frame_locals.items() if not name.startswith('__') and not name.endswith('__')}
        return {'objects': objects, 'variables': variables}

    def walk_object(self, obj, objects, user_classes):
        if isinstance(obj, (bool, int, float, type(None))):
            return obj
        if isinstance(obj, str):
            return f'\'{obj}\''
        ref = str(id(obj))
        if ref in objects:
            return ref,
        else:
            objects[ref] = {'type': type(obj).__name__, 'members': []}
        if isinstance(obj, (tuple, list, set, frozenset)):
            members = enumerate(obj)
        elif isinstance(obj, dict):
            members = obj.items()
        elif isinstance(obj, type) or isinstance(obj, (*user_classes,)):
            if isinstance(obj, type):
                user_classes.add(obj)
            members = [(name, getattr(obj, name)) for name in dir(obj)
                       if not name.startswith('__') and not name.endswith('__')]
        else:
            return type(obj).__name__
        walk_members = [(self.walk_object(name, objects, user_classes), self.walk_object(value, objects, user_classes))
                        for name, value in members]
        objects[ref]['members'] = walk_members
        return ref,


def main():
    pass


if __name__ == '__main__':
    main()
