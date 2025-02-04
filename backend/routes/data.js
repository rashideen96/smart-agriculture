const Json2csvParser = require("json2csv").Parser;
const fs = require("fs");
const express = require('express');
const Data = require('../model/data.model');
const router = express.Router();
const path = require('path');

function dataWithTime(arr) {
    return arr.map((m) => {
        return {
            temp: m.data.temp,
            humd: m.data.humd,
            LM35: m.data.LM35,
            voltage: m.data.voltage,
            current: m.data.current,
            light: m.data.light,
            createdAt: m.createdAt
        }
    })
}

router.get('/save', function (req, res) {
    let limit = parseInt(req.params.limit) || 100;
    Data
        .find({})
        .sort({ 'createdAt': -1 })
        .limit(limit)
        .exec(function (err, data) {

            if (err) return res.status(500).send(err);
            const json2csvParser = new Json2csvParser({ header: true });

            const dArr = [];
            data.forEach(element => {
                dArr.push(element.data)
            });
            const csvData = json2csvParser.parse(dArr);
            const csvPath = path.join('excel_data', Date.now() + '.csv');

            // console.log(dArr)
            fs.writeFile(csvPath, csvData, function (error) {
                if (error) throw error;
                console.log("Write to csv successfully!");
                res.status(200).json({ msg: 'Data successfully save as csv' });
            });


        });
});

router.get('/file', (req, res, next) => {
    const filePath = path.join('excel_data');
    const fileList = [];
    fs.readdir(filePath, (err, files) => {
        if (err) next(err);
        files.forEach(file => {
            console.log(file)
            fileList.push(file);
        });
        res.status(200).json({ fileList: fileList });
    });

})

router.delete('/file/:id', (req, res, next) => {
    const fileId = req.params.id;
    const dirPath = path.join('excel_data');

    fs.unlink(dirPath + '/' + fileId + '-mongodb_fs.csv', (err) => {
        if (err) next(err);
        res.status(200).json({ msg: 'File successfully deleted' })
    })
})

// router.get('/:deviceId/:limit', function (req, res) {
//     var macAddress = req.params.deviceId;
//     var limit = parseInt(req.params.limit) || 30;
//     Data
//         .find({
//             macAddress: macAddress
//         })
//         .sort({ 'createdAt': -1 })
//         .limit(limit)
//         .exec(function (err, devices) {
//             if (err) return res.status(500).send(err);
//             res.status(200).json(devices);
//         });
// });
router.get('/:limit', function (req, res) {
    var limit = parseInt(req.params.limit) || 30;
    Data
        .find({})
        .sort({ 'createdAt': -1 })
        .limit(limit)
        .exec(function (err, devices) {
            if (err) return res.status(500).send(err);
            res.status(200).json(devices);
        });
});

router.post('/', function (req, res) {
    var data = req.body;
    // data.createdBy = req.user._id;
    Data.create(data, function (err, _data) {
        if (err) return res.status(500).send(err);
        res.json(_data);
    });
})
module.exports = router;