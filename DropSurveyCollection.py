import os
import configparser
from pymongo import MongoClient
import argparse
import sys
from json_utils import update_success_json
json_file = "success.json"

def drop_collections(env, collections=None):
    try:
        # Load configuration from the config.ini file
        config_path = os.path.join('common_config', 'config_survey.ini')
        config = configparser.ConfigParser()
        config.read(config_path)

        # Check if the environment exists in the configuration
        if env not in config:
            print(f"Environment '{env}' not found in config.ini.")
            sys.exit(1)

        # Extract MongoDB details for the specified environment
        mongo_url = config[env]['mongo_url']
        database_name = config[env]['database_name']

        # Get collection names from the command line or config.ini
        if collections:
            collection_names = [col.strip() for col in collections.split(',')]
        else:
            collection_names = [col.strip() for col in config[env]['collection_name'].split(',')]

        # Connect to the MongoDB server
        client = MongoClient(mongo_url)

        # Access the specified database
        db = client[database_name]

        # Drop each collection
        for collection_name in collection_names:
            if collection_name in db.list_collection_names():
                db[collection_name].drop()
                print(f"Collection '{collection_name}' dropped successfully from database '{database_name}' in the '{env}' environment.")
            else:
                print(f"Collection '{collection_name}' does not exist in database '{database_name}' in the '{env}' environment.")

        update_success_json(json_file, "DropSurveyCollection", "true")
        # Close the MongoDB connection
        client.close()

    except Exception as e:
        print(f"An error occurred: {e}")
        sys.exit(1)

if __name__ == "__main__":
    # Parse command-line arguments
    parser = argparse.ArgumentParser(description="Drop MongoDB collections based on the environment.")
    parser.add_argument("--env", required=True, help="Environment to use (local, dev, qa, prod).")
    parser.add_argument("--collections", help="Comma-separated list of collection names to drop. Overrides config.ini.")
    args = parser.parse_args()

    # Call the drop_collections function with the specified arguments
    drop_collections(args.env, args.collections)
