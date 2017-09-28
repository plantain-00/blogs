## mac reload jenkins

```
sudo launchctl unload /Library/LaunchDaemons/org.jenkins-ci.plist
sudo launchctl load /Library/LaunchDaemons/org.jenkins-ci.plist
```

## dig and whois

```
dig: dns info
whois: domain name info
```

## vuejs directive

vue 内部事件的 hook

## git remove from index

```bash
git rm node_modules/ --cached -r
```

## nodejs http/2 push

```bash
node --expose-http2 server.js
```

```js
const http2 = require('http2')
const fs = require('fs')

const server = http2.createSecureServer({
    key: fs.readFileSync('private_key.pem'),
    cert: fs.readFileSync('server.pem')
});

server.on('stream', (stream, headers) => {
    stream.pushStream({ ':path': '/index.js' }, pushStream => {
        pushStream.respondWithFile('./index.js', {
            'content-type': 'application/javascript',
            ':status': 200,
        })
    })
    stream.respond({
        'content-type': 'text/html',
        ':status': 200
    })
    stream.end('hello world<script src="./index.js"></script>')
});

server.listen(8080)
```

## local https for test

```bash
openssl genrsa -out private_key.pem 1024/2038
req -new -x509 -key private_key.pem -out server.pem -days 365
# Common Name: localhost
```

## zip / p7zip

```bash
7z a -r -tzip foo.zip foo/
7z a -r -m0=LZMA -mx=9 -t7z foo.7z foo/
zip -r9 foo.zip foo/
```

## check and update npm dependencies and devDependencies

```bash
update () {
    cd ~/$1
    pwd
    npm-check -u --registry=https://registry.npm.taobao.org -E
    npm run build
    npm run lint
}
update "test-project"
```

## chrome disable crossdomain

```
--args --disable-web-security --user-data-dir =C:\MyChromeDevUserData --allow-file-access-from-files
```

## oracle

```ts
function executeSafely(connection: oracledb.IConnection, sql: string, bindParams: any[], options?: oracledb.IExecuteOptions) {
    return new Promise<oracledb.IExecuteReturn>((resolve, reject) => {
        connection.execute(sql, bindParams, options || {}, (executeError, result) => {
            if (executeError) {
                connection.release(releaseError => {
                    if (releaseError) {
                        reject(releaseError);
                    } else {
                        reject(executeError);
                    }
                });
            } else {
                resolve(result);
            }
        });
    });
}

function commitSafely(connection: oracledb.IConnection) {
    return new Promise<void>((resolve, reject) => {
        connection.commit(commitError => {
            if (commitError) {
                connection.release(releaseError => {
                    if (releaseError) {
                        reject(releaseError);
                    } else {
                        reject(commitError);
                    }
                });
            } else {
                resolve();
            }
        });
    });
}
```

## 并行、并发、同步 / 异步

+ 并行 parallel：可以同时利用 CPU 的多核心来计算
+ 并发 concurrency：可以同时处理多用户的请求
+ 同步 synchronous / 异步 asynchronous：当代码运行的某个阶段，需要 IO 操作，不需要 CPU 参与时，不能 / 能解放 CPU 资源用于处理其它事情

## es decorator

```ts
const classDecorator1: ClassDecorator = (target: typeof Foo) => {
    Object.getOwnPropertyNames(target.prototype).forEach(key => {
        if (key === "constructor") {
            return;
        }
        const descriptor = Object.getOwnPropertyDescriptor(target.prototype, key);
    });
};
const classDecorator2 = (value: number): ClassDecorator => {
    return (target: typeof Foo) => {

    };
};
const propertyDecorator1: PropertyDecorator = (target: Foo, propertyKey: string | symbol) => {

}
const propertyDecorator2 = (value: number): PropertyDecorator => {
    return (target: Foo, propertyKey: string | symbol) => {

    }
}
const methodDecorator1: MethodDecorator = (target: Foo, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<(bar3: number) => void>) => {
    return descriptor;
}
const methodDecorator2 = (value: number): MethodDecorator => {
    return (target: Foo, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<(bar3: number) => void>) => {
        return descriptor;
    }
}
const parameterDecorator1: ParameterDecorator = (target: Foo, propertyKey: string | symbol, parameterIndex: number) => {

}
const parameterDecorator2 = (value: number): ParameterDecorator => {
    return (target: Foo, propertyKey: string | symbol, parameterIndex: number) => {

    }
}
@classDecorator1
@classDecorator2(1)
class Foo {
    @propertyDecorator1
    @propertyDecorator2(1)
    bar1: number;
    @methodDecorator1
    @methodDecorator2(1)
    bar2(
        @parameterDecorator1
        @parameterDecorator2(1)
        bar3: number
        ) {
        console.log(bar3);
    };
}
const foo = new Foo();
```

## pcre

```bash
cd /usr/local/src
wget ftp://ftp.csx.cam.ac.uk/pub/software/programming/pcre/pcre-8.40.tar.gz
tar -xzvf pcre-8.40.tar.gz
cd pcre-8.40
./configure  
make && make install
```

## install nginx

```bash
nginx -v
cd /usr/local/src
wget http://nginx.org/download/nginx-1.10.2.tar.gz
tar zxvf nginx-1.10.2.tar.gz
cd nginx-1.10.2/
./configure --user=www \
--group=www \
--prefix=/usr/local/nginx \
--sbin-path=/usr/local/nginx/nginx \
--conf-path=/usr/local/nginx/nginx.conf \
--pid-path=/usr/local/nginx/nginx.pid \
--with-http_ssl_module \
--with-http_v2_module \
--with-zlib=/usr/local/src/zlib-1.2.11 \
--with-openssl=/usr/local/src/openssl-1.0.2k \
--with-http_stub_status_module \
--with-threads
make
ln -s /usr/local/nginx/nginx /usr/sbin/nginx
```

## zlib

```bash
cd /usr/local/src  
wget http://zlib.net/zlib-1.2.11.tar.gz
tar -zxvf zlib-1.2.11.tar.gz
cd zlib-1.2.11
./configure    --prefix=/usr/local/zlib
make && make  install
```

## centos 7 update openssl

```bash
openssl version
cd /usr/local/src
wget https://www.openssl.org/source/openssl-1.0.2k.tar.gz
tar -zxvf openssl-1.0.2k.tar.gz
cd  openssl-1.0.2k
./config
make && make install
mv /usr/bin/openssl /usr/bin/openssl.old 
mv /usr/include/openssl /usr/include/openssl.old
ln -s /usr/local/ssl/bin/openssl /usr/bin/openssl 
ln -s /usr/local/ssl/include/openssl /usr/include/openssl
echo "/usr/local/ssl/lib" >> /etc/ld.so.conf 
ldconfig -v
openssl version
```

## acme.sh

```bash
1. curl https://get.acme.sh | sh
2. remove TXT record
3. export Ali_Key="sdfsdfsdfljlbjkljlkjsdfoiwje"
export Ali_Secret="jlsdflanljkljlfdsaklkjflsa"
4. acme.sh --issue --dns dns_ali -d mydomain.com
5. acme.sh --renew -d mydomain.com
6. acme.sh --installcert -d mydomain.com --keypath /opt/mydomain.key --certpath /opt/mydonain.cer --capath /opt/mydonain.ca.cer --fullchainpath /opt/mydonain.fullchain.cer --reloadcmd "service nginx reload"

1. curl https://get.acme.sh | sh
2. acme.sh --issue --dns -d mydomain.com
3. add the generated TXT record
4. acme.sh --renew -d mydomain.com
5. acme.sh --installcert -d mydomain.com --keypath /opt/mydomain.key --certpath /opt/mydonain.cer --capath /opt/mydonain.ca.cer --fullchainpath /opt/mydonain.fullchain.cer --reloadcmd "service nginx reload"
```

## nginx 301 302

```nginx
server {
    listen       80;
    server_name  www.example.com;
    location / {
    }
}
server {
    listen       80;
    server_name  example.com;
    rewrite ^(.*) http://www.example.com$1 permanent; # 301
}
server {
    listen       80;
    server_name  example.com;
    rewrite ^(.*) http://www.example.com$1 redirect; # 302
}
```

## check size of directory

```bash
du -sh foo/
```

## svn and git commands

```bash
svn propedit svn:ignore .
svn status
svn update
svn add * --force
svn commit

git status
git add * --force
git commit -m ""
```

## checkers

1. npm i -g npm-check
2. npm i -g nsp
3. https://developers.google.com/speed/pagespeed/insights/

## create private and public key

```bash
openssl genrsa -out test.key 1024
openssl rsa -in test.key -pubout -out test_pub.key
```

## RSA sign and verify

```js
function rsaSign(text, key) {
    const signer = crypto.createSign("RSA-SHA1");
    signer.update(text);
    return signer.sign(privateKey, "base64");
}

function rsaVerify(text, key, sign) {
    const verify = crypto.createVerify("RSA-SHA1");
    verify.update(text);
    return verify.verify(publicKey, sign, "base64");
}
```

## RSA encrypt and decrypt

```
crypto.privateDecrypt
crypto.privateEncrypt
crypto.publicDecrypt
crypto.publicEncrypt
```

## refresh parent window

```js
window.parent.opener.location = '';
```

+ window.opener refers to the window that called window.open( ... ) to open the window from which it's called
+ window.parent refers to the parent of a window in a &lt;frame&gt; or &lt;iframe&gt;
+ window.top refers to the top-most window from a window nested in one or more layers of &lt;iframe&gt; sub-windows

## npm publish

```bash
npm adduser
npm publish . --access public
```

## vertical align image and text

```html
<img style="vertical-align:bottom;">text
```

## mysql json

```sql
select field1->"$.a" from table1;
select json_extract(field1,"$.a") from table1;
update table1 set field1= json_set(field1,"$.a",field1->"$.a" + 1) where id = 2;
select * from table1 where field1->'$.a'=2
```

## supervisor

```bash
sudo apt-get install python-setuptools
easy_install supervisor
echo_supervisord_conf > /etc/supervisord.conf
[program:redis]
command=redis-server
autostart=true
autorestart=true
startsecs=3
supervisord
supervisorctl
```

## ubuntu change root password

```
press ESC to enter recover mode
mount -rw -o remount /
passwd root
```

## ubuntu host

```
/etc/hosts
```

## echo

```bash
multiline and 
echo '1st line
2nd line'
```

override:

```bash
echo 123 > a.txt
```

append:

```bash
echo 123 >> a.txt
```

disable variable:

```bash
echo '$HOME'
```

enable variable:

```bash
echo "$HOME"
```

calculate:

```bash
echo admin:$(openssl passwd -crypt 123456)
```

## ubuntu start scripts after boot

1. create scripts started with `S` in `/etc/rc.d/init.d`
2. soft link to `/etc/rc.d/rc5.d`

## bash function

```bash
foo () {
    echo $1
}
foo "bar"
```

## enable ssh for ubuntu

```bash
sudo apt-get update
sudo apt-get install openssh-server
ps -e | grep ssh
service ssh start
```

## check cron

http://crontab.guru/

## ntp

```bash
ntpdate -u 192.168.1.1
```

## replace

```js
text.replace(word, () => "*".repeat(word.length));
```

## nfs

### ubuntu server

```bash
sudo apt-get install nfs-kernel-server
sudo vim /etc/exports
/home/shdx2016/mount_test *(rw,sync,no_root_squash)
sudo /etc/init.d/portmap restart
sudo /etc/init.d/nfs-kernel-server restart
showmount -e
```

### client

```bash
sudo mount -t nfs 192.168.100.40:/home/shdx2016/mount_test /home/shdx2016/mount_test2
sudo umount /home/shdx2016/mount_test2
```

## gpg

### install gpg

`brew install gpg2`

### create a new gpg key

`gpg --gen-key`

choose `RSA and RSA` and `4096`

show the created key: `gpg --list-secret-keys --keyid-format LONG`

the result should be like:

```
sec   4096R/3AA5C34371567BD2 2016-03-10 [expires: 2017-03-10]
uid                          Hubot 
ssb   4096R/42B317FD4BA89E7A 2016-03-10
```

### export

`gpg --armor --export 3AA5C34371567BD2`

paste the result to somewhere like github

### let git know

```bash
git config --global user.signingkey 3AA5C34371567BD2
git config --global commit.gpgsign true
```

### let sourcetree know(optional)

set path of gpg: `/usr/local/Cellar/gnupg2/2.0.29/bin`

## soft link

```bash
ln -s source dist
```

## change typescript sdk in vscode

```
"typescript.tsdk": "node_modules/typescript/lib"
```

## change editor for linux

```bash
sudo select-editor
```

## jsonp

```js
const callbackRegex = new RegExp("^[0-9a-zA-Z_.]+$");
if (callback) {
    callbackRegex.test("name");
    response.setHeader("Content-Type","text/javascript");
    response.status(200).send(`${callback}(${JSON.stringify(json)})`);
}
```

## port 843 tcp service for flash

```js
const xml = '<cross-domain-policy><allow-access-from domain="*" to-ports="*" /></cross-domain-policy>';
const net = require("net");

net.createServer(client => {
    client.setTimeout(1500, function () {
        client.destroy();
    });
    client.on("data", data => {
        if (data.toString() === "<policy-file-request/>\0") {
            client.end(xml);
        } else {
            client.destroy();
        }
    });
}).listen(843, () => {
    console.log("policy service running...");
});
```

## download electron.js too slow

```bash
export ELECTRON_MIRROR="https://npm.taobao.org/mirrors/electron/"
```

## logstash config

```bash
./bin/logstash agent -f logstash.conf
```

```
input {
    file {
        path => ["/opt/logs/*.log"]
    }
}
output {
    elasticsearch {
        hosts => ["localhost:9200"]
    }
}
```

## tar

```bash
tar -zxvf a.tar.gz
```

## locate a program file

```bash
which nginx
```

## xcopy

```json
{
  "scripts": {
    "sync-recursion": "xcopy /s /Y .\\foo\\*.js ..\\deploy\\foo\\",
    "sync-no-recursion": "xcopy /Y .\\bar\\*.js ..\\deploy\\bar\\",
    "sync": "npm run sync-recursion && npm run sync-no-recursion"
  }
}
```

## check system information

```bash
uname -a
```

## check logs

```bash
tail -n -20 -f a.log
```

## delete redis keys that matches a pattern

```bash
redis-cli --raw KEYS "pattern" | xargs redis-cli --raw DEL
```

## java environment variables

```bash
export JAVA_HOME=/usr/lib/jvm/java-1.8.0-openjdk-1.8.0.91-0.b14.el7_2.x86_64
export JRE_HOME=${JAVA_HOME}/jre
export CLASSPATH=.:${JAVA_HOME}/lib:${JRE_HOME}/lib
export PATH=${JAVA_HOME}/bin:$PATH
```

## nginx basic auth

```bash
echo admin:$(openssl passwd -crypt 123456) > nginx_auth_file.conf
```

```nginx
server {
    listen       8001;
    location / {
        auth_basic "need login";
        auth_basic_user_file nginx_auth_file.conf;
        proxy_pass http://test;
    }
}
```

## pm2 logs

```bash
pm2 install pm2-logrotate
```

## redis-cli

```bash
redis-cli --raw get foo
```

## environment variable

windows: `set NODE_PORT=9999`
linux: `export NODE_PORT=9999`

## fail2ban

```bash
# CentOS
yum install fail2ban -y
cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local

vim /etc/fail2ban/jail.local
```

```
[sshd]
enabled=true
```

```bash
# CentOS 6:
service fail2ban restart
chkconfig fail2ban on

# CentOS 7:
systemctl restart fail2ban.service
systemctl enable fail2ban
```

## alipay and wspay sign

```ts
function composeParameters(parameters: any) {
    const querystring = Object.keys(parameters)
        .filter(key => parameters[key] !== undefined && parameters[key] !== null && parameters[key] !== "" && ["sign_type", "sign"].indexOf(key) < 0)
        .sort()
        .map(key => `${key}="${parameters[key]}"`)
        .join("&");

    return querystring;
}

function alipayMd5Sign(parameters: any) {
    const querystring = Object.keys(parameters)
        .filter(key => parameters[key] !== undefined && parameters[key] !== null && parameters[key] !== "" && ["sign_type", "sign"].indexOf(key) < 0)
        .sort()
        .map(key => `${key}=${parameters[key]}`)
        .join("&");

    return libs.md5(querystring + alipayMD5Key);
}

function alipayRsaVerify(parameters: any, publicKey: string) {
    const querystring = composeParameters(parameters);
    const verify = libs.crypto.createVerify("RSA-SHA1");
    verify.update(querystring);
    return verify.verify(publicKey, parameters.sign, "base64");
}

function alipayRsaSign(parameters: any, privateKey: string) {
    const querystring = composeParameters(parameters);
    const signer = libs.crypto.createSign("RSA-SHA1");
    signer.update(querystring);
    parameters.sign = encodeURIComponent(signer.sign(privateKey, "base64"));
    return `${querystring}&sign="${parameters.sign}"&sign_type="${parameters.sign_type}"`;
}

function wspay(parameters: any) {
    const querystring = Object.keys(parameters)
        .filter(key => parameters[key] !== undefined && parameters[key] !== null && parameters[key] !== "" && ["pfx", "partner_key", "sign", "key"].indexOf(key) < 0)
        .sort()
        .map(key => key + "=" + parameters[key])
        .join("&") + "&key=" + wspayKey;

    return libs.md5(querystring).toUpperCase();
}
```

## aes

```ts
const mode = "aes-128-ecb";

export function decrypt(token: string): string {
    const decipher = libs.crypto.createDecipher(mode, key);
    return decipher.update(token, "hex", "utf8") + decipher.final("utf8");
}

function encrypt(text: string): string {
    const cipher = libs.crypto.createCipher(mode, key);
    return cipher.update(text, "utf8", "hex") + cipher.final("hex");
}
```

## ws pressure test

```ts
// server
import * as WebSocket  from "ws";

const WebSocketServer = WebSocket.Server;
const port = 8080;
const wss = new WebSocketServer({
    port: port
});

setInterval(() => {
    console.log(wss.clients.length);
}, 10 * 1000);
console.log(`started at ${port}`);

// client
import * as WebSocket  from "ws";

let connectionCount = 0;
let errorCount = 0;
let lastError;
let totalCount = 0;
const interval = 10 * 1000;
const frequency = 1000;

setInterval(() => {
    for (let i = 0; i < frequency; i++) {
        setTimeout(() => {
            const ws = new WebSocket("ws://localhost:8080/");
            ws.on("open", () => {
                connectionCount++;
            });
            ws.on("close", () => {
                connectionCount--;
            });
            ws.on("error", error => {
                errorCount++;
                lastError = error;
            });
            totalCount++;
        }, Math.random() * interval);
    }
    console.log(`${connectionCount}/${totalCount}  ${errorCount} errors`);
    if (lastError) {
        console.log(lastError);
        lastError = undefined;
    }
}, interval);
```

## homebrew install specific version

```bash
brew search xyz
brew install xyz
brew unlink xyz
brew link xyz2 --force
```

## ssh keys

```bash
# client
ssh-keygen -t rsa
ssh-agent bash
ssh-add ~/.ssh/id_rsa
# server
/etc/ssh/sshd_config
chmod 700 .ssh
cd .ssh
cat id_rsa.pub >> authorized_keys
chmod 600 authorized_keys
```

## install svn server at ubuntu server

```bash
sudo apt-get install subversion
sudo svnadmin create /home/svn/demo
sudo chmod -R o+rw /home/svn
```

/home/svn/demo/conf/authz

```conf
[/]
admin = user1
@admin =rw
* =
```

/home/svn/demo/conf/passwd

```conf
user1 = password1
```

/home/svn/demo/conf/svnserve.conf

```conf
anon-access = none
auth-access = write
password-db = passwd
```

```bash
svnserve -d -r /home/svn
```

## set network

```bash
sudo vim /etc/network/interfaces
```

```conf
auto eth0
iface eth0 inet static
address 192.168.100.40
netmask 255.255.255.0
gateway 192.168.100.1
```

```bash
sudo ifup eth0
sudo /etc/init.d/networking restart
sudo vim /etc/resolv.conf
```

```conf
nameserver 192.168.100.1
```

for centos:

`/etc/sysconfig/network-scripts/ifcfg-eth0`

```conf
nameserver 114.114.114.114
```

```bash
service network restart
```

## set a cpu core for a process

```bash
taskset -pc 7 1622
```

## check a cpu core for a process

```bash
taskset -pc 1622
ps -o pid,psr,comm -1622
```

## check limit of server

`/etc/sysctl.conf`

```bash
cat /proc/sys/fs/file-nr
```

```conf
net.ipv4.tcp_wmem = 4096 87380 4161536
net.ipv4.tcp_rmem = 4096 87380 4161536
net.ipv4.tcp_mem = 786432 2097152 3145728
fs.file-max = 1000000
fs.nr_open = 1000000
```

```bash
sudo /sbin/sysctl -p
```

`/etc/security/limits.conf`

```bash
cat /proc/29875/limits
```

```conf
*         hard    nofile      1000000
*         soft    nofile      1000000
root      hard    nofile      1000000
root      soft    nofile      1000000
```

```bash
pm2 start app.js --name="my app" --node-args="--nouse-idle-notification --expose-gc --max-old-space-size=8192" -- -p 9000
```

```ts
import * as profiler from "v8-profiler";
import * as fs from "fs";

let profilerRunning = false;

export function toggleProfile() {
    if (profilerRunning) {
        const profile = libs.profiler.stopProfiling();
        console.log("stopped profiling");
        profile.export()
            .pipe(libs.fs.createWriteStream(`${Date.now()}.cpuprofile`))
            .once("error", libs.profiler.deleteAllProfiles)
            .once("finish", libs.profiler.deleteAllProfiles);
        profilerRunning = false;
    } else {
        libs.profiler.startProfiling();
        profilerRunning = true;
        console.log("started profiling");
    }
}

export function takeSnapshot() {
    const snapshot = libs.profiler.takeSnapshot();
    snapshot.export()
        .pipe(libs.fs.createWriteStream(`${Date.now()}.heapsnapshot`))
        .on("finish", snapshot.delete);
}
```

## install OS from USB

1. open .iso file with UltraISO
2. click ` 启动光盘 - 写入硬盘映像 `, ` 格式化 ` and ` 写入 `
3. press ESC, F2 or F8 to enter BIOS, change the first reboot device
4. mind the network setting and set an user

## go environment

```bash
go get -u github.com/golang/net github.com/golang/tools
```

move to `golang.org/x/net` and `golang.org/x/tools`

```bash
go run xyz.go
```

## disable support for export cipher suites and use a 2048-bit Diffie-Hellman group

```bash
openssl dhparam -out dhparams.pem 2048
```

```nginx
    ssl_ciphers 'ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:DHE-DSS-AES128-GCM-SHA256:kEDH+AESGCM:ECDHE-RSA-AES128-SHA256:ECDHE-ECDSA-AES128-SHA256:ECDHE-RSA-AES128-SHA:ECDHE-ECDSA-AES128-SHA:ECDHE-RSA-AES256-SHA384:ECDHE-ECDSA-AES256-SHA384:ECDHE-RSA-AES256-SHA:ECDHE-ECDSA-AES256-SHA:DHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA:DHE-DSS-AES128-SHA256:DHE-RSA-AES256-SHA256:DHE-DSS-AES256-SHA:DHE-RSA-AES256-SHA:AES128-GCM-SHA256:AES256-GCM-SHA384:AES128-SHA256:AES256-SHA256:AES128-SHA:AES256-SHA:AES:CAMELLIA:DES-CBC3-SHA:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!aECDH:!EDH-DSS-DES-CBC3-SHA:!EDH-RSA-DES-CBC3-SHA:!KRB5-DES-CBC3-SHA';
    ssl_prefer_server_ciphers on;
    ssl_dhparam /opt/dhparams.pem;
```

## docker-gitlib

1. docker: https://docs.docker.com/engine/installation/
2. docker-compose: https://docs.docker.com/compose/install/
3. `wget https://raw.githubusercontent.com/sameersbn/docker-gitlab/master/docker-compose.yml`
4. `pwgen -Bsv1 64`
5. `docker-compose up -d`
6. `docker-compose.yml
    - GITLAB_HOST=git.yorkyao.xyz
    - GITLAB_PORT=443
    - GITLAB_HTTPS=true`
7. nginx

```nginx
    upstream gitlab {
        server localhost:10080;
    }

    server {
        listen       443 ssl http2;
        ssl on;
        ssl_certificate /opt/1_git.yorkyao.xyz_bundle.crt;
        ssl_certificate_key /opt/git_ssl.key;
        server_name git.yorkyao.xyz;

        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header X-Frame-Options SAMEORIGIN;

        location / {
            proxy_pass http://gitlab;
        }
    }
```

## linux swap

```bash
dd  if=/dev/zero  of=/swapfile1  bs=1024  count=524288
mkswap  /swapfile1
chown root:root /swapfile1
chmod 0600  /swapfile1
swapon  /swapfile1
vi    /etc/fstab
/swapfile1 swap swap defaults 0 0
free -m
```

## react with babel

```js
let babel = require("gulp-babel");
for (let file of jsxFiles) {
    gulp.src(`components/${file}.jsx`)
        .pipe(babel())
        .pipe(rename(`${file}.js`))
        .pipe(gulp.dest("build"));
}
```

`.babelrc`

```json
{
    "presets": ["es2015", "react"]
}
```

## nginx proxy

```nginx
    map $http_upgrade $connection_upgrade {
        default upgrade;
        '' close;
    }
    server {
        listen       9998;
        server_name  localhost;

        location ~*/socket.io/* {
            proxy_pass https://yorkyao.xyz;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "Upgrade";
        }

        location / {
            add_header Access-Control-Allow-Origin http://localhost:8888;
            proxy_pass https://yorkyao.xyz;
        }
    }
    server {
        listen       9999;
        server_name  localhost;

        location / {
            add_header Access-Control-Allow-Origin http://localhost:8888;
            proxy_pass https://img.yorkyao.xyz;
        }
    }
    server {
        listen       7777;
        server_name  localhost;

        location / {
            proxy_pass https://img.yorkyao.xyz;
        }
    }
```

## nginx sample

```nginx
# gzip
gzip on;
gzip_min_length 1k;
gzip_buffers 16 64k;
gzip_http_version 1.1;
gzip_comp_level 6;
gzip_types text/plain application/javascript text/css;
gzip_vary on;

# add_header_nginx.conf
add_header "X-Frame-Options" "DENY"
add_header "X-XSS-Protection" "1; mode=block"
add_header "Strict-Transport-Security" "max-age=31536000; includeSubDomains" always;
add_header "Content-Security-Policy" "default-src *;script-src 'self';style-src 'self' 'unsafe-inline' 'unsafe-eval';font-src 'self' data:;img-src 'self' data:;connect-src 'self' md.yorkyao.xyz wss://md.yorkyao.xyz"
add_header "Public-Key-Pins" 'pin-sha256="klO23nT2ehFDXCfx3eHTDRESMz3asj1muO+4aIdjiuY="; pin-sha256="633lt352PKRXbOwf4xSEa1M517scpD3l5f79xMD9r9Q="; max-age=2592000; includeSubDomains';
add_header "X-Content-Type-Options" "nosniff"
add_header "X-DNS-Prefetch-Control" "off"
add_header "X-Download-Options" "noopen"
add_header 'Access-Control-Allow-Origin' '*';
add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
add_header 'Access-Control-Allow-Headers' 'DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type';

# proxy_set_header_nginx.conf
proxy_set_header X-Real-IP \$remote_addr;
proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
proxy_set_header Host  \$http_host;
proxy_set_header X-Nginx-Proxy true;

# http_upgrade_nginx.conf
proxy_http_version 1.1;
proxy_set_header Upgrade \$http_upgrade;
proxy_set_header Connection 'Upgrade';

server {
    listen       80;
    return       301 https://$host$request_uri;
}
upstream deployRobot {
    server localhost:9996;
}
server {
    listen       9995 ssl http2;
    listen       [::]:9995;
    ssl on;
    ssl_certificate /opt/1_yorkyao.xyz_bundle.crt;
    ssl_certificate_key /opt/ssl.key;
    server_name  yorkyao.xyz;
    location / {
        include /opt/proxy_set_header_nginx.conf;
        include /opt/add_header_nginx.conf;
        proxy_pass http://deployRobot;
    }
}
upstream imageUploader {
    server localhost:9999;
}
server {
    listen       443 ssl http2;
    listen       [::]:443;
    ssl on;
    ssl_certificate /opt/1_upload.yorkyao.xyz_bundle.crt;
    ssl_certificate_key /opt/upload_ssl.key;
    server_name  upload.yorkyao.xyz;
    location / {
        include /opt/proxy_set_header_nginx.conf;
        include /opt/add_header_nginx.conf;
        proxy_pass http://imageUploader;
    }
}

server {
    listen       443 ssl http2;
    listen       [::]:443;
    ssl on;
    ssl_certificate /opt/1_img.yorkyao.xyz_bundle.crt;
    ssl_certificate_key /opt/img_ssl.key;
    server_name  img.yorkyao.xyz;
    location ~*\.(jpg|jpeg|gif|png|ico|cur|gz|svg|svgz)$ {
        root         /opt/backends/images/;
        access_log off;
    }
}

server {
    listen       443 ssl http2;
    listen       [::]:443;
    ssl on;
    ssl_certificate /opt/1_doc.yorkyao.xyz_bundle.crt;
    ssl_certificate_key /opt/doc_ssl.key;
    server_name  doc.yorkyao.xyz;
    location ~*\.(js|css|jpg|jpeg|gif|png|ico|cur|gz|svgz|map|mp4|ogg|ogv|webm|htc|json|ttf|woff)$ {
        root         /opt/doc/_book;
        expires 1M;
        access_log off;
        add_header Cache-Control public;
    }
    location ~*\.(html|svg)$ {
        root         /opt/doc/_book;
        index index.html;
        access_log off;
    }
}
upstream backends {
    server localhost:9998;
}
map $http_upgrade $connection_upgrade {
    default upgrade;
    '' close;
}
server {
    listen       443 ssl http2;
    listen       [::]:443;
    ssl on;
    ssl_certificate /opt/1_yorkyao.xyz_bundle.crt;
    ssl_certificate_key /opt/ssl.key;
    server_name yorkyao.xyz www.yorkyao.xyz;
    location ~*/socket.io/* {
        include /opt/http_upgrade_nginx.conf;
        include /opt/proxy_set_header_nginx.conf;
        include /opt/add_header_nginx.conf;
        proxy_pass http://backends;
    }
    location ~*\.(js|css|jpg|jpeg|gif|png|ico|cur|gz|svg|svgz|map|mp4|ogg|ogv|webm|htc|json|ttf|woff)$ {
        root         /opt/frontends/dest/;
        expires 1M;
        access_log off;
        add_header Cache-Control public;
    }
    location ~*\.html$ {
        root         /opt/frontends/dest/;
        try_files $uri /index.html;
        access_log off;
    }
    location =/ {
        root         /opt/frontends/dest/;
        index index.html;
        access_log off;
    }
    location / {
        include /opt/proxy_set_header_nginx.conf;
        include /opt/add_header_nginx.conf;
        proxy_pass http://backends;
    }
}
```

## SSL

1. `openssl rsa -in ssl.key -out ssl2.key`
2. nginx

```nginx
        listen       80;
        listen       443 ssl;
        listen       [::]:80;
        ssl on;
        ssl_certificate /opt/ssl.crt;
        ssl_certificate_key /opt/ssl2.key;
        server_name wosign.com www.wosign.com;
```

## XSS

1. http only cookie
2. check the input from user
3. check the output to html

## CSRF

1. captcha
2. check referer
3. token

## nginx

### install

http://nginx.org/en/docs/install.html

### config

```
/etc/nginx
/usr/local/nginx/
/usr/local/etc/nginx/
```

## port

```bash
netstat -ano | grep 80
```

## Segmentation fault: 11

```bash
npm rebuild
```

## cron

```bash
# 1. config
crontab -e
# 2. restart
# for CentOS 5/6:
service crond restart
# for CentOS 7:
systemctl restart crond.service
# for Ubuntu:
sudo /etc/init.d/cron restart
# 3. status
crontab -u root -l
service crond status
# 4. log
/var/log/cron
/var/log/cron.log
# 5. enable log
# for Ubuntu:
sudo vim /etc/rsyslog.d/50-default.conf
sudo  service rsyslog  restart
```

## website develop environment

1. structure
2. cache
3. log
4. document
5. db
6. auto unit test
7. code repository
8. auto deploy
9. auto complie
10. backup
11. setting

## install mysql

```bash
# 1. install
sudo apt-get install mysql-server
sudo apt-get install mysql-client
sudo apt-get install libmysqlclient-dev

# 2. check whether is mysql installed successfully
sudo netstat -tap | grep mysql

# 3. can access mysql from outside of the server
# remove `bind-address = 127.0.0.1` from `/etc/mysql/my.conf`
```

## install mongodb

https://www.mongodb.org/downloads

```bash
# add admin user
mongo
use admin
db.system.users.find()
db.createUser(
  {
    user: "admin_user",
    pwd: "admin_password"
  }
)
db.auth('admin_user','admin_password')

# 2. add a user for a db
db.createUser(
    {
      user: "user",
      pwd: "password",
      roles: [
         { role: "readWrite", db: "db_name" }
      ]
    }
)

# 3. turn on auth and set ip
# /etc/mongod.conf
```

## install redis

http://redis.io/download

## change file format

```bash
vim abc.sh
:set ff=unix
:set ff
:wq
```

## install git

http://git-scm.com/download/linux

## install mariadb

https://downloads.mariadb.org/mariadb/repositories/#mirror=opencas

```bash
sudo service mysql start
mysqladmin -u root password 'password'
```

## install nodejs

https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager

## show pid

```bash
ps aux | grep node
```

## git

```bash
git add -A
git reset --hard
git config --system core.longpaths true

# rebase:
git reset
git push -f

# revert to last commit:
git reset --hard HEAD^

# store local git password:
git config --global credential.helper store

git clone a branch:
git clone -b [branch] [remote_repo] . --depth=1

# git submodule:
git submodule update --init --recursive
```

git pull request & fork workflow:

0. Create a team
1. Create the main repository, set permissions, clone, commit, push
2. Fork the repository, clone, commit, push, create pull request
3. Merge

## centos

```bash
# ssh
ssh -p 22 root@1.1.1.1
# dns
/etc/resolv.conf
# query cpu
cat /proc/cpuinfo | grep name | cut -f2 -d: | uniq -c 
# query network
ifstat
```

## mysql

```bash
# 1. Create Database 'database1', and grant it to new user 'user1/password1'
# login: 
mysql -u root -p

create database:
show databases;
create database database1;
show databases;

# create user:
select User,Host,Password from mysql.user;
CREATE USER 'user1'@'%' IDENTIFIED BY 'password1';
select User,Host,Password from mysql.user;

# grant permissions:
grant select,insert,update,delete,create,drop,alter,create view,show view on database1.* to user1@'%' identified by 'password1';
flush privileges;
SHOW GRANTS FOR 'user1'@'%';

# revoke permisions if necessary:
revoke all on database1.* from user1@'%';

# 2. backup
mysqldump -h 127.0.0.1 -u root -p dbname > /opt/filename.sql

# 3. query database size
use information_schema;
SELECT concat(round(sum(DATA_LENGTH/1024/1024),2),'MB') as data FROM TABLES WHERE table_schema='table name';
```
