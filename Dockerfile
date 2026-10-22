FROM node:22-alpine
WORKDIR /app
COPY --chown=node:node package.json server.cjs registration-pages.cjs ./
COPY --chown=node:node public ./public
USER node
EXPOSE 3000
CMD ["node", "server.cjs"]
