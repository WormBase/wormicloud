FROM node:8.2.1 as build-stage
RUN mkdir /usr/src/app
WORKDIR /usr/src/app
ENV PATH /usr/src/app/node_modules/.bin:$PATH
COPY frontend/ .
RUN curl -o /usr/src/app/src/assets/videos/tutorial.mp4 https://caltech-curation.textpressolab.com/files/pub/wormicloud/tutorial.mp4
RUN npm install --silent
RUN npm run build --production

FROM nginx:1.15.2-alpine

COPY --from=build-stage /usr/src/app/build/ /var/www

COPY frontend/nginx.conf /etc/nginx/nginx.conf

# production environment
EXPOSE 5010
ENTRYPOINT ["nginx","-g","daemon off;"]