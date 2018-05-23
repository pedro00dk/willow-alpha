FROM ubuntu:latest

ENV LANG=C.UTF-8

RUN apt update && \
    apt -y install wget && \
    apt -y install python3 && \
    apt -y install python3-pip && \
    apt -y install nodejs && \
    apt -y install npm && \
    rm -rf /var/lib/apt/lists/*

RUN wget -O libpng12.deb http://mirrors.kernel.org/ubuntu/pool/main/libp/libpng/libpng12-0_1.2.54-1ubuntu1_amd64.deb && \
    dpkg -i libpng12.deb && \
    rm libpng12.deb

WORKDIR ./willow
COPY ./ ./

RUN pip3 install --no-cache-dir -r requirements.txt
RUN npm install -g npm && npm install

EXPOSE 8000

ENTRYPOINT python3 manage.py runserver & node server.js
