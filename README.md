# Flask Application Deployment on AWS Elastic Beanstalk

This guide outlines the steps to deploy a Flask web application with a MongoDB backend on AWS Elastic Beanstalk.

# Linux/MacOS

## Prerequisites

1. **AWS Account:**
   - Ensure you have an AWS account. If not, sign up for an account at [AWS](https://aws.amazon.com/).

2. **AWS CLI and Elastic Beanstalk CLI:**
   - Install the AWS CLI by following the instructions [here](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html).
   - Install the Elastic Beanstalk CLI by running `pip install awsebcli`.

3. **MongoDB:**
   - Set up a MongoDB database and obtain the MongoDB URI.

4. **Git:**
   - Install Git from [https://git-scm.com/](https://git-scm.com/).

5. **Python and Pip:**
   - Ensure you have Python and Pip installed on your machine.

## Running App Locally

1. source venv/bin/activate
2. pip install -r requirements.txt
3. flask run
4. Open localhost:5000

## Uninstall All Dependencies

1. source venv/bin/activate
2. pip freeze | xargs pip uninstall -y
3. deactivate

## Troubleshoot ModuleNotFoundError

In the case of all dependencies are correctly installed but the app gets `ModuleNotFoundError`, do the following:

1. Close all IDE and terminal
2. Open IDE and terminal again

# Windows

## Prerequisites
1. Install the most recent stable python version https://www.python.org/downloads/windows/
2. python -m pip install --upgrade pip
3. virtualenv venv
4. set-executionpolicy remotesigned
5. .\venv\Scripts\activate
6. pip install -r requirements.txt

## Troubleshoot ebcli

### Uninstall ebcli from a specified python version
py -3.12 -m pip uninstall awsebcli
