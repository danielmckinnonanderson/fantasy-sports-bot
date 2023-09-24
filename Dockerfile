FROM oven/bun as builder

WORKDIR /app

# Move package.json & application code to app
COPY src ./app/src
COPY main.ts ./app/main.ts
COPY package.json ./app/package.json

# Install application dependencies
RUN bun install ./app

# Compile a native executable
RUN bun build --compile ./app/main.ts --outfile ./build/ff-bot

# Start
FROM oven/bun

ENV LEAGUE_ID=$LEAGUE_ID
ENV BOT_ID=$BOT_ID

COPY --from=builder /app ./

RUN cd ./app

CMD [ "./build/ff-bot", "./", "--bot-id", "${BOT_ID}", "--league-id", "${LEAGUE_ID}}"]
