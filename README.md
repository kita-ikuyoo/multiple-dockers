Overview
This repository records a CI|CD pipeline built by myself for self-study. 
The technologies used in this project are as follows:
Nginx: Reverse proxy
Docker: Speed and simplify deployment
Github Actions: Automate the CI|CD pipeline
AWS: The actual deployment platform

Requirements:
An AWS account
A docker account

Setting of environments:
Check the docker-image.yml file in ./github/workflows, there are environment variables you should set in Github Actions
secrets.DOCKER_USERNAME: the username of your docker account
secrets.AWS_ACCESS_KEY_ID: the access keyid of the user you are going to use
secrets.AWS_SECRET_ACCESS_KEY: the access key of the user you are going to use
secrets.EB_application_name: the name of the EB application you are going to use
secrets.EB_environment_name: the name of the EB environment you are going to use
Check the docker-compose.yml file, there are environment variables that you should set in AWS Elastic Beanstalk
They are easy to be understood, so I will skip them here.


Architecture:
The architecture of this project
<img width="701" height="226" alt="image" src="https://github.com/user-attachments/assets/3171d92d-165d-430b-a902-b43ec86b8c62" />
The architecture of the application 
<img width="621" height="291" alt="Untitled Diagram drawio (1)" src="https://github.com/user-attachments/assets/39eec412-df56-44b7-a21a-84c3fda8c90d" />

How to use:
Run the defined Github Action

To be done:
Use terraform to standarlize the settings of cloud infrastructure.
