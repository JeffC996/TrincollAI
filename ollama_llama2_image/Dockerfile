FROM ollama/ollama

COPY start.sh /start.sh

RUN chmod +x /start.sh

# 容器启动的时候执行的命令
ENTRYPOINT ["/bin/sh", "-c"]
CMD ["/start.sh"]