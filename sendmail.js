
const nodemailer = require("nodemailer");
const fs = require('fs')
const path = require('path')
const multer = require('multer')
const express = require("express")
const app = express()
var route = express.Router();
const utils = require('util')
const puppeteer = require('puppeteer')
const hb = require('handlebars')
const readFile = utils.promisify(fs.readFile)


app.use(express.json())

var pdfName = ''

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS, POST, HEAD, PATCH, DELETE');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'output/')
    },
    filename: function (req, file, cb) {
        pdfName = Date.now() + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1]
        cb(null, pdfName)
    }
})

var upload = multer({ storage: storage });

//Upload route
app.post('/upload', upload.single('pdf'), (req, res, next) => {

    const file = req.file
    if (!file) {
        const error = new Error('Please upload a file')
        error.httpStatusCode = 400
        return next(error)
    }
    res.send(pdfName)
});



let transporter = nodemailer.createTransport({
    host: "e2e-57-192.e2enetworks.net.in",
    port: 587,
    secure: false, // true for 465, false for other ports

    auth: {
        user: "leads@avision.co.in", // generated ethereal user
        pass: "&kF4&OPEw#X7", // generated ethereal password
    },
});

app.post('/mail', async (req, res) => {
   
    await transporter.sendMail({
        from: '"Avision " <leads@avision.co.in>',
        to: req.body.email,
        subject: "Avision Talent Search Exam Result",
        text: "Thanks for attempting A Vision Talent Search Exam. Wish you all the best of the future, keep your eye on our website for latest updates",
        html: "<b>Thanks for attempting A Vision Talent Search Exam. Wish you all the best of the future, keep your eye on our website <a>avision.co.in</a> for latest updates</b>",
        attachments: [
            {
                filename: 'file-name.pdf', // <= Here: made sure file name match
                path: path.join(__dirname, `./output/${req.body.pdf}`), // <= Here
                contentType: 'application/pdf'
            }
        ]
    }).then(() => {
        res.send("Mail Send")
    }).catch((error) => {
        res.send(error)
    })
})



app.post('/generatepdf', async (req, res) => {
    var examId = req.body.exam_id
    var userId = req.body.user_id
    let currentURL = `http://localhost:4200/exam/${examId}/atse-analysis/${userId}`;
    puppeteer.launch().then(async browser => {
        const page = await browser.newPage();
        await page.setContent(currentURL, {
            waitUntil: ["load", "networkidle2"]
        });
        await page.goto(currentURL, { waitUntil: 'networkidle2' });
        page.waitForSelector("#pdf");
        var pdfFile = Date.now() + ".pdf"
        await page.pdf({ path: './output/' + pdfFile, format: 'A4', printBackground: true })
        await browser.close();
        console.log("Downloaded the PDF")
        res.send(pdfFile)
    });
})







// async function generatePdf() {

//     let currentURL = "http://localhost:4200/exam/16/atse-analysis/6";
//     puppeteer.launch().then(async browser => {
//         const page = await browser.newPage();
//         await page.setContent(currentURL, {
//             waitUntil: ["load","networkidle2"]
//         });  
//         await page.goto(currentURL, {waitUntil: 'networkidle2'});
//         page.waitForSelector("#pdf");
//         await page.screenshot({ path: 'full_img.png', fullPage: true });
//         var pdfFile = Date.now() + ".pdf"
//         await page.pdf({ path: './output/' + pdfFile, format: 'A4', printBackground: true })
//         await browser.close();
//         console.log("Downloaded the PDF")
//     });


// }






// generatePdf();


app.listen(3000, () => console.log("Server is Running on port 3000"))




