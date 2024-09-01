#!/usr/bin/env python3

from pathlib import Path

import json

root_directory = Path('dist/img')

def get_files(file_list, directory:Path, extension_list):
    for entry in directory.iterdir():
        if entry.name == '.':
            continue

        if entry.is_dir():
            get_files(file_list, entry, extension_list)
        else:
            if entry.suffix in extension_list:
                file_list.append(entry.name)


    return file_list

def main():
    data_list = get_files([], root_directory, ['.jpg', '.jpg2', '.png', '.webp'])
    s = json.dumps(data_list, indent=2)
    with open('dist/data.json', 'w') as f:
        f.write(s)


if __name__ == '__main__':
    main()
