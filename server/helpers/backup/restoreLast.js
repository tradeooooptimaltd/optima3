/* eslint-disable no-console */
const restore = require('mongodb-restore');
const path = require('path');
const fs = require('fs');

const FILE_NAME_REGEX = /dump-/;
const DATABASE_URL = 'mongodb://localhost/pl-finance';

const BACKUPS_FOLDER = path.join(__dirname, '..', '..', '..', 'backups');
let lastDumpName = null;

if (!fs.existsSync(BACKUPS_FOLDER)) {
    console.log('No backups found');
} else {
    fs.readdirSync(BACKUPS_FOLDER)
        .map(fileName => {
            if (!FILE_NAME_REGEX.test(fileName)) {
                return null;
            }

            const fileDateSrc = fileName.slice(5).slice(0, -4);
            const [year, month, day, hour, minute] = fileDateSrc.split('-');

            return {
                name: fileName,
                date: +(new Date(+year, +month, +day, +hour, +minute))
            };
        })
        .filter(file => !!file)
        .sort((prevItem, nextItem) => nextItem.date - prevItem.date)
        .forEach((file, i) => {
            if (i === 0) {
                lastDumpName = file.name;
            }
        });

    if (!lastDumpName) {
        console.log('Last backup not found');
    } else {
        restore({
            uri: DATABASE_URL,
            root: BACKUPS_FOLDER,
            parser: 'json',
            tar: lastDumpName,
            drop: true,
            callback: (err) => {
                if (err) {
                    console.warn('Error: ', err);
                    return;
                }

                console.log('Success!');
            }
        });
    }
}
