import os

from ConfigParser import ConfigParser
from optparse import OptionParser

TEMPLATE_EXTENSION = '.template'

def process(variables_path, skip_default=False, force=False):
    # Parse variables file.
    ETC_DIR_PATH = os.path.dirname(variables_path)
    BIN_DIR_PATH = os.path.join(os.path.dirname(ETC_DIR_PATH), 'bin')

    variables = {}
    try:
        with open(variables_path) as f:
            lines = f.readlines()
            block = None

            for line in lines:
                line = line.strip()
                if line.startswith('[') and line.endswith(']'):
                    block = {
                        'field': line[1:-1]
                    }
                if '=' in line:
                    key, value = line.split('=', 1)
                    block[key] = value
                elif line == '' and block is not None:
                    # End of the block
                    variables[block.pop('field')] = block
                    block = None
    except IOError as e:
        print 'Variables file doesnt exist in following path: %s' % (variables_path,)
        exit()
    except Exception as e:
        print 'Variables file is malformed. Terminating...'
        print e
        exit()

    data = {}
    for field, options in variables.iteritems():
        if options.get('default') and skip_default:
            data[field] = options.get('default')
        else:
            question = options.get('help', '')
            if options.get('default'):
                question += ' [%s]' % (options.get('default'))

            question += ': '
            if eval(options.get('required', 'False')):
                while True:
                    answer = raw_input(question)
                    if answer:
                        break
            else:
                answer = raw_input(question)

            if answer == '':
                answer = options.get('default', '')

            data[field] = answer

    # Generate config files

    etc_templates = [os.path.join(ETC_DIR_PATH, path) for path in os.listdir(ETC_DIR_PATH) if path.endswith(TEMPLATE_EXTENSION)]
    bin_templates = [os.path.join(BIN_DIR_PATH, path) for path in os.listdir(BIN_DIR_PATH) if path.endswith(TEMPLATE_EXTENSION)]
    for path in etc_templates + bin_templates:
        config_path = path[:-len(TEMPLATE_EXTENSION)]
        if os.path.exists(config_path) and not force:
            answer = raw_input('%s exists, it will be overwritten. Type in Y if you want to proceed: ' % (config_path,))
            if answer != 'Y':
                print 'Terminating...'
                exit()

        with open(path) as template:
            with open(config_path, 'w') as config:
                config.write(template.read().format(**data))

            print '%s is generated.' % (config_path,)

if __name__ == '__main__':
    description = """
        This script will generate config files.
    """
    usage = 'usage: %prog path to variables file [options]'
    parser = OptionParser(usage=usage, description=description)
    parser.add_option('-s', action='store_true', default=False,
                      help='Skip default values.')
    parser.add_option('-f', '--force', action='store_true', default=False,
                      help='Overwrite config file if exists.')

    (options, args) = parser.parse_args()

    if not args:
        parser.print_help()
        exit()

    process(args[0], skip_default=options.s, force=options.force)
