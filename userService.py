import imaplib
import base64
import os
from dotenv import load_dotenv
import time
from configparser import ConfigParser, ExtendedInterpolation
import wget
import urllib
import xlrd
import uuid
import csv
from bson.objectid import ObjectId
import json
from datetime import datetime
import requests
from difflib import get_close_matches
from requests import post, get, delete
import sys
import time
import xlwt
import xlutils
from xlutils.copy import copy
import shutil
import re
from xlrd import open_workbook
from xlutils.copy import copy as xl_copy
import logging
import logging.handlers
import time
from logging.handlers import TimedRotatingFileHandler
import xlsxwriter
import argparse
import sys
from os import path
import pandas as pd
import openpyxl
from openpyxl import Workbook
from openpyxl.styles import Color, PatternFill, Font, Border
from openpyxl.styles import colors
from openpyxl.cell import Cell
import gdown
from mimetypes import guess_extension
from json_utils import update_success_json
from json_utils import proceed_only_on_success
json_file = "success.json"

update_success_json(json_file, "userService", "false")

load_dotenv()

# get current working directory
currentDirectory = os.getcwd()

# Read config file 
config = ConfigParser()
config.read('common_config/config_user.ini')


# email regex
regex = "\"?([-a-zA-Z0-9.`?{}]+@\w+\.\w+)\"?"

# Global variable declaration
criteriaLookUp = dict()
millisecond = None
programNameInp = None
environment = None
observationId = None
solutionName = None
pointBasedValue = None
entityType = None
allow_multiple_submissions = None
scopeEntityType = ""
programName = None
userEntity = None
roles = ""
mainRole = ""
dictCritLookUp = {}
isProgramnamePresent = None
solutionLanguage = None
keyWords = None
entityTypeId = None
solutionDescription = None
creator = None
projectServiceLoginId = None
criteriaName = None
solutionId = None
API_log = None
listOfFoundRoles = []
entityToUpload = None
programID = None
programExternalId = None
programDescription = None
criteriaLookUp = dict()
themesSheetList = []
themeRubricFileObj = dict()
criteriaLevelsReport = False
ecm_sections = dict()
criteriaLevelsCount = 0
numberOfResponses = 0
criteriaIdNameDict = dict()
criteriaLevels = list()
matchedShikshalokamLoginId = None
scopeEntities = []
scopeRoles = []
countImps = 0
ecmToSection = dict()
entitiesPGM = []
stateEntitiesPGM = []
entitiesPGMID = []
entitiesType = []
solutionRolesArr = []
startDateOfResource = None
endDateOfResource = None
startDateOfProgram = None
endDateOfProgram = None
rolesPGM =None
mainRole = None
solutionRolesArray = []
solutionStartDate = ""
solutionEndDate = ""
projectCreator = ""
orgIds = []
OrgName = []
ccRootOrgName = None
ccRootOrgId  = None
certificatetemplateid = None
question_sequence_arr = []


# Generate access token for the APIs. 
def generateAccessToken():
    # production search user api - start
    headerKeyClockUser = {'Content-Type': config.get(environment, 'content-type')}
    loginBody = {
        'email' : os.getenv('email'),
        'password' : os.getenv('password')
    }
    responseKeyClockUser = requests.post(config.get(environment, 'elevateuserhost') + config.get(environment, 'userlogin'), headers=headerKeyClockUser, json=loginBody)
    
    messageArr = []
    messageArr.append("URL : " + str(config.get(environment, 'userlogin')))
    messageArr.append("Body : " + str(os.getenv('keyclockapibody')))
    messageArr.append("Status Code : " + str(responseKeyClockUser.status_code))
    if responseKeyClockUser.status_code == 200:
        responseKeyClockUser = responseKeyClockUser.json()
        accessTokenUser = responseKeyClockUser['result']['access_token']
        print("--->Access Token Generated!")
        return accessTokenUser
    
    print("Error in generating Access token")
    print("Status code : " + str(responseKeyClockUser.status_code))
    terminatingMessage("Please check API logs.")

def terminatingMessage(message):
    print(message)
    exit(1)

def convert_sheets_to_csv(programFile):
    # Define the output folder
    output_folder = "UserServiceCSV"
    
    # Create the folder if it doesn't exist
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)
    
    # Load the Excel file
    try:
        excel_data = pd.ExcelFile(programFile)
    except Exception as e:
        print(f"Error loading Excel file: {e}")
        return
    
    # Iterate over each sheet in the Excel file
    for sheet_name in excel_data.sheet_names:
        try:
            # Read the sheet into a DataFrame
            sheet_data = excel_data.parse(sheet_name)
            
            # Define the CSV file path
            csv_file_path = os.path.join(output_folder, f"{sheet_name}.csv")
            
            # Save the DataFrame to CSV
            sheet_data.to_csv(csv_file_path, index=False)
            print(f"Saved {sheet_name} to {csv_file_path}")
        except Exception as e:
            print(f"Error processing sheet '{sheet_name}': {e}")




def UserCreate():      
        header_create_user = {
            'Content-type':'application/json'
        }
        csv_file_path = './UserServiceCSV/UserData.csv'
        with open(csv_file_path, mode='r') as csvfile:
            reader = csv.DictReader(csvfile)
        # Process each row in the CSV
            for row in reader:
                try:
                    # Extract relevant data from the row
                    email = row['email']
                    password = row['password']
                    name = row['name']

                    user_payload = {
                        "email": email,
                        "password": password,
                        "name": name,
                       
                    }
                    # Make the API call to create user data
                    url_create_user_api = config.get(environment, 'elevateuserhost') + config.get(environment, 'CreateUserData')
                    response = requests.post(
                        url=url_create_user_api,
                        headers=header_create_user,
                        data=json.dumps(user_payload)
                    )
                    if response.status_code == 201:
                        print(f"User creation succeeded for title: {name}")
                    else:
                        print(f"User creation failed for title: {name}")
                        print(f"Response: {response.text}")
                        break
                except Exception as e:
                    print(f"Error processing row: {row}. Error: {str(e)}")
                    break




def AdminCreate():      
        header_create_user = {
            'Content-type':'application/json',
            'internal_access_token':'internal_access_token'
        }
        csv_file_path = './UserServiceCSV/AdminUser.csv'
        with open(csv_file_path, mode='r') as csvfile:
            reader = csv.DictReader(csvfile)
        # Process each row in the CSV
            for row in reader:
                try:
                    # Extract relevant data from the row
                    email = row['email']
                    password = row['password']
                    name = row['name']
                    secret_code = os.getenv("secret_code"),

                    user_payload = {
                        "email": email,
                        "password": password,
                        "name": name,
                        "secret_code":secret_code
                       
                    }
                    # Make the API call to create user data
                    url_create_user_api = config.get(environment, 'elevateuserhost') + config.get(environment, 'AdminUserData')
                    response = requests.post(
                        url=url_create_user_api,
                        headers=header_create_user,
                        data=json.dumps(user_payload)
                    )
                    if response.status_code == 201:
                        print(f"User Admin creation succeeded for title: {name}")
                    else:
                        print(f"User creation failed for title: {name}")
                        print(f"Response: {response.text}")
                        break
                except Exception as e:
                    print(f"Error processing row: {row}. Error: {str(e)}")
                    break




def EntityTypeCreate(accessToken):      
        header_create_user = {
            'X-auth-token': 'bearer ' + accessToken,
            'Content-type':'application/json'
        }
        csv_file_path = './UserServiceCSV/entityType.csv'
        with open(csv_file_path, mode='r') as csvfile:
            reader = csv.DictReader(csvfile)
        # Process each row in the CSV
            for row in reader:
                try:
                    # Extract relevant data from the row
                    value = row['value']
                    label = row['label']
                    allow_filtering = row['allow_filtering']
                    data_type = row['data_type']
                    has_entities = row['has_entities']
                    model_names = eval(row['model_names'])

                    user_payload = {
                        "value": value,
                        "label": label,
                        "allow_filtering": allow_filtering,
                        "data_type": data_type,
                        "has_entities": has_entities,
                        "model_names": model_names,
                       
                    }
                    # Make the API call to create user data
                    url_create_user_api = config.get(environment, 'elevateuserhost') + config.get(environment, 'EntityTypeCreate')
                    response = requests.post(
                        url=url_create_user_api,
                        headers=header_create_user,
                        data=json.dumps(user_payload)
                    )
                    if response.status_code == 201:
                        print(f"Entity Type creation succeeded for label: {label}")
                    else:
                        print(f"Entity Type failed for label: {label}")
                        print(f"Response: {response.text}")
                        break
                except Exception as e:
                    print(f"Error processing row: {row}. Error: {str(e)}")
                    break



def EntitiesCreate(accessToken):      
        header_create_user = {
            'X-auth-token': 'bearer ' + accessToken,
            'Content-type':'application/json'
        }

        csv_file_path = './UserServiceCSV/entity.csv'
        with open(csv_file_path, mode='r') as csvfile:
            reader = csv.DictReader(csvfile)
        # Process each row in the CSV
            for row in reader:
                try:
                    # Extract relevant data from the row
                    value = row['value']
                    label = row['label']
                    status = row['status']
                    type = row['type']
                    entity_type_id = row['entity_type_id']

                    user_payload = {
                        "value": value,
                        "label": label,
                        "status": status,
                        "type": type,
                        "entity_type_id": entity_type_id,
                       
                    }
                    # Make the API call to create user data
                    url_create_user_api = config.get(environment, 'elevateuserhost') + config.get(environment, 'EntitiesCreate')
                    response = requests.post(
                        url=url_create_user_api,
                        headers=header_create_user,
                        data=json.dumps(user_payload)
                    )
                    if response.status_code == 201:
                        print(f"Entities creation succeeded for label: {label}")
                    else:
                        print(f"Entities creation failed for label: {label}")
                        print(f"Response: {response.text}")
                        break
                except Exception as e:
                    print(f"Error processing row: {row}. Error: {str(e)}")
                    break



def valid_file(param):
    base, ext = os.path.splitext(param)
    if ext.lower() not in ('.xlsx'):
        raise argparse.ArgumentTypeError('File must have a csv extension')
    return param


# function to check environment 
def envCheck():
    try:
        config.get(environment, 'userlogin')
        return True
    except Exception as e:
        print(e)
        return False


# Main function were all the function def are called
def mainFunc(programFile):
        convert_sheets_to_csv(programFile)
        AdminCreate()
        UserCreate()
        accessToken = generateAccessToken()
        EntityTypeCreate(accessToken)
        EntitiesCreate(accessToken)
        update_success_json(json_file, "userService", "success")
        print("User Service Execution Completed")
                   
                                                                                                                   

#main execution
start_time = time.time()
parser = argparse.ArgumentParser()
parser.add_argument('--UserFile', type=valid_file)
parser.add_argument('--env', '--env')
argument = parser.parse_args()
programFile = argument.UserFile
environment = argument.env
millisecond = int(time.time() * 1000)

if envCheck():
    print("=================== Environment set to " + str(environment) + "=====================")
else:
    terminatingMessage(str(environment) + " is an invalid environment")
wbPgm = xlrd.open_workbook(programFile, on_demand=True)
sheetNames = wbPgm.sheet_names()
pgmSheets = ["UserData","entityType", "entity", "AdminUser"]

if len(sheetNames) == len(pgmSheets) and sheetNames == pgmSheets:
    print("--->User Template detected.<---")
    millisecond = int(time.time() * 1000)
    result = proceed_only_on_success(json_file, "deleteUserService")
    if result != True:
       terminatingMessage("Deletion of user failed hence not proceeding with userService.py script....")
    mainFunc(programFile)
    end_time = time.time()


   
else:
      print("-----> User Template Not Valid")
end_time = time.time()

print("Execution time in sec : " + str(end_time - start_time))