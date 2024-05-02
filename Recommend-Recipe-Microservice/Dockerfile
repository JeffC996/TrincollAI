# 使用 Node.js 14 版本的官方镜像
FROM node:20

# 创建并设置应用的工作目录
WORKDIR /app

# 复制 package.json 文件到工作目录
COPY package.json ./

# 安装依赖
RUN npm install

# 复制应用的其他文件到工作目录
COPY . .

# 声明运行时容器提供服务的端口
EXPOSE 2001

# 定义容器启动时执行的命令
CMD ["node", "app.js"]
