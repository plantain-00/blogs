const childProcess = require('child_process')
const fs = require('fs')

const files = fs.readdirSync('contents');
for (const file of files) {
    console.log(`${file}...`)
    childProcess.execSync(`pangu "contents/${file}" "contents/${file}"`)
}
