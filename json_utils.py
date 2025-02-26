import json

def update_success_json(json_file_path, key_to_update, value_to_update):
    with open(json_file_path, 'r', encoding='utf-8') as file:
        data = json.load(file)
    
    data[key_to_update] = value_to_update
    
    with open(json_file_path, 'w', encoding='utf-8') as file:
        json.dump(data, file, ensure_ascii=False, indent=4)


def proceed_only_on_success(json_file_path, key_to_check):
    with open(json_file_path, 'r', encoding='utf-8') as file:
        data = json.load(file)
    
    if data[key_to_check] == "true":
        return True
    else:
        return False