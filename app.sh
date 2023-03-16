#!/bin/bash

sleep 30


sudo yum update -y

# # Install Postgres
# sudo yum install postgresql postgresql-server postgresql-devel postgresql-contrib -y


# sudo amazon-linux-extras enable postgresql14
# sudo yum install postgresql-server -y
# sudo postgresql-setup initdb
# sudo sed -i 's/ident/md5/g' /var/lib/pgsql/data/pg_hba.conf
# sudo systemctl start postgresql
# sudo systemctl enable postgresql
# sudo systemctl status postgresql
# sudo -u postgres psql
# sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD '1234567890';"


# # Initialize the Postgres database
# sudo service postgresql initdb

# # Start the Postgres service
# sudo service postgresql start
# # systemctl
# # Create a new PostgreSQL user and database
# sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'password123';"
# sudo -u postgres psql -c "CREATE DATABASE db1;"
# # sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE db1 TO $PG_USER;"

# # Configure PostgreSQL to allow remote connections
# sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/g" /etc/postgresql/<version>/main/postgresql.conf
# sudo echo "host    all             all             0.0.0.0/0               md5" >> /etc/postgresql/<version>/main/pg_hba.conf
# sudo cat  /etc/postgresql/<version>/main/pg_hba.conf
# # Restart PostgreSQL to apply changes
# sudo service postgresql restart


echo "Installing nodejs"
sudo yum install -y gcc-c++ make
curl -sL https://rpm.nodesource.com/setup_16.x | sudo -E bash -
sudo yum install -y nodejs
echo "nodejs installed successfully"
echo "$(npm --version) is the version of npm"

sudo amazon-linux-extras install postgresql10

echo "Installing unzip"
sudo yum install unzip -y
# cd 
# mkdir webApp
# sudo cp /tmp/webApp.zip /home/ec2-user/webApp/webApp.zip
# pwd
# ls
# unzip /home/ec2-user/webApp/webApp.zip -d /home/ec2-user/webApp
# ls
# cd /home/ec2-user/webApp/webApp
unzip /home/ec2-user/webApp.zip -d /home/ec2-user/webApp
cd /home/ec2-user/webApp

npm install 

sudo mv /tmp/project.service /etc/systemd/system/project.service
sudo systemctl enable project.service
sudo systemctl start project.service