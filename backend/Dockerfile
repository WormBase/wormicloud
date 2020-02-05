FROM python:3.7-slim

WORKDIR /usr/src/app/
ADD requirements.txt .
RUN pip3 install -r requirements.txt
COPY backend backend

ENV DB_HOST=""
ENV DB_NAME=""
ENV DB_USER=""
ENV DB_PASSWD=""
ENV PORT=8010
ENV TPC_TOKEN=""
ENV PYTHONPATH=$PYTHONPATH:/usr/src/app/

EXPOSE ${PORT}

CMD python3 backend/api.py -N ${DB_NAME} -U ${DB_USER} -P "${DB_PASSWD}" -H ${DB_HOST} -p ${PORT} -t ${TPC_TOKEN}