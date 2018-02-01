from functools import reduce


class SubprocessInput:

    def __init__(self, io_main_to_sub_queue, io_sub_to_main_queue):
        self.io_main_to_sub_queue = io_main_to_sub_queue
        self.io_sub_to_main_queue = io_sub_to_main_queue

    def __call__(self, prompt=''):
        prompt = str(prompt)
        self.io_sub_to_main_queue.put('input')
        self.io_sub_to_main_queue.put(prompt)
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
        text = reduce((lambda e0, e1: e0 + sep + e1), map((lambda e: str(e)), values)) + end
        self.io_sub_to_main_queue.put('print')
        self.io_sub_to_main_queue.put(text)


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


###############
import multiprocessing


def func(io_main_to_sub_queue, io_sub_to_main_queue):
    subprocess_disable_modules(COMMON_DISABLE_MODULES)
    subprocess_disable_functions(COMMON_DISABLE_FUNCTIONS)

    globals()['__builtins__']['input'] = SubprocessInput(io_main_to_sub_queue, io_sub_to_main_queue)
    globals()['__builtins__']['print'] = SubprocessPrint(io_main_to_sub_queue, io_sub_to_main_queue)

    v = input('require input\n')
    print('printing', float(v))

    v = input('require input\n')
    print('printing', float(v))

    v = input('require input\n')
    print('printing', float(v))


def main():
    io_main_to_sub_queue = multiprocessing.Queue()
    io_sub_to_main_queue = multiprocessing.Queue()
    p = multiprocessing.Process(target=func, args=(io_main_to_sub_queue, io_sub_to_main_queue))
    p.start()

    for i in range(30):
        action = io_sub_to_main_queue.get()
        print('action: ' + action)
        if action == 'print':
            print(io_sub_to_main_queue.get(), end='')
        if action == 'input':
            print(io_sub_to_main_queue.get(), end='')
            #x = input(io_sub_to_main_queue.get())
            io_main_to_sub_queue.put(i)

    p.join()


if __name__ == '__main__':
    main()
