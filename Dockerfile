FROM ubuntu:latest

ENV LANG=C.UTF-8

RUN apt update && \
    apt -y install wget && \
    apt -y install python3 && \
    apt -y install python3-pip && \
    apt -y install nodejs && \
    apt -y install npm && \
    rm -rf /var/lib/apt/lists/*


WORKDIR ./willow
COPY ./ ./

RUN pip3 install --no-cache-dir -r ./api/requirements.txt
RUN npm install -g npm && npm install --prefix ./client/

EXPOSE 1234
EXPOSE 8000

ENTRYPOINT python3 ./api/manage.py runserver & npm start --prefix ./client/
