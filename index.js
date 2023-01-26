const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const cheerio = require('cheerio');
var http = require('http');
var fs = require('fs');
//const Pageres = require('pageres');
//const Pageres = (...args) => import('pageres');
//const querystring = require('querystring');
const fastify = require('fastify')({ logger: true })

//set time zone
process.env.TZ = 'Asia/Bangkok';

//if process.port is not empty , then set port to 8080
const port = process.env.PORT || 8080;

let historical = [];

async function getData() {
    let body = "";
    try {
        const response = await fetch('https://www.bangchak.co.th/th/oilprice/historical');
        body = await response.text();
    } catch (error) {
        return historical;
    }


    //console.log(body);
    const $ = cheerio.load(body);

    //console first tr inside tbody
    let tr = $('tbody tr').first();
    //console.log(tr.text());

    //console.log(sparray(tr.text()));

    //console second tr inside tbody
    let tr2 = $('tbody tr').eq(1);
    //console.log(tr2.text());

    //console.log(sparray(tr2.text()));

    //get count of difference sparray(tr.text()) and sparray(tr2.text())
    let count = 0;
    for (let i = 0; i < sparray(tr.text()).length; i++) {
        if (sparray(tr.text())[i] != sparray(tr2.text())[i]) {
            count++;
        }
    }
    console.log("======")
    console.log(count);
    console.log("======")

    //if count = 1, tr = tr2 and tr2 = $('tbody tr').eq(2)
    if (count == 1) {
        tr = tr2;
        tr2 = $('tbody tr').eq(2);
    }

    //add sparray tr and tr2 to array
    const arr = [sparray(tr.text()), sparray(tr2.text())];
    //console.log(arr);
    //console.log(arr[0][0]);
    //console.log(arr[1][0]);

    //find - in arr[0] and arr[1] and replace to 0
    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr[i].length; j++) {
            if (arr[i][j] == "-") {
                arr[i][j] = "0";
            }
        }
    }

    //move arr[0][5] to back and remove arr[0][5]
    arr[0].push(arr[0][5]);
    arr[0].splice(5, 1);
    //move arr[1][5] to back and remove arr[1][5]
    arr[1].push(arr[1][5]);
    arr[1].splice(5, 1);

    //get 2 string
    var date1 = new Date(arr[0][0].substr(3, 2) + '/' + arr[0][0].substr(0, 2) + '/' + (parseInt(arr[0][0].substr(6, 4)) - 543));
    var date2 = new Date(arr[1][0].substr(3, 2) + '/' + arr[1][0].substr(0, 2) + '/' + (parseInt(arr[1][0].substr(6, 4)) - 543));
    console.log(date1);
    console.log(date2);

    const pttprice = await fetch("https://orapiweb1.pttor.com/api/oilprice/search", {
        "headers": {
            "accept": "application/json, text/plain, */*",
            "accept-language": "th-TH,th;q=0.9,en;q=0.8",
            "content-type": "application/json",
            "sec-ch-ua": "\"Google Chrome\";v=\"107\", \"Chromium\";v=\"107\", \"Not=A?Brand\";v=\"24\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"macOS\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site",
            "Referer": "https://www.pttor.com/",
            "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "body": "{\"provinceId\":1,\"districtId\":null,\"year\":" + date1.getFullYear() + ",\"month\":" + (date1.getMonth() + 1) + ",\"pageSize\":1000000,\"pageIndex\":0}",
        "method": "POST"
    });
    const pttbody = await pttprice.json();

    //console.log(pttbody);

    const pttarr = JSON.parse(pttbody.data[0].priceData);
    let yesterday

    if (pttbody.data.length == 1) {
        const backuppttprice = await fetch("https://orapiweb1.pttor.com/api/oilprice/search", {
            "headers": {
                "accept": "application/json, text/plain, */*",
                "accept-language": "th-TH,th;q=0.9,en;q=0.8",
                "content-type": "application/json",
                "sec-ch-ua": "\"Google Chrome\";v=\"107\", \"Chromium\";v=\"107\", \"Not=A?Brand\";v=\"24\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"macOS\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-site",
                "Referer": "https://www.pttor.com/",
                "Referrer-Policy": "strict-origin-when-cross-origin"
            },
            "body": "{\"provinceId\":1,\"districtId\":null,\"year\":" + date1.getFullYear() + ",\"month\":" + date1.getMonth() + ",\"pageSize\":1000000,\"pageIndex\":0}",
            "method": "POST"
        });
        const backuppttbody = await backuppttprice.json();
        yesterday = JSON.parse(backuppttbody.data[0].priceData);
    } else {
        yesterday = JSON.parse(pttbody.data[1].priceData);
    }

    //const yesterday = JSON.parse(pttbody.data[1].priceData);
    const pttdate = new Date(pttbody.data[0].priceDate);
    console.log('pttdate', pttdate);

    //if date1 is not same date as pttdate, get yesterday
    //if (date1.getDate() != pttdate.getDate()) {
    pttarr.forEach(e => {
        if (e.OilTypeId == 7) {
            arr[0][10] = arr[0][9]
            arr[0][9] = '' + e.Price
        }
        /*if (e.OilTypeId == 1) {
            arr[0][11] = '' + e.Price
        }*/
        if (e.OilTypeId == 22) {
            //arr[0][12] = '' + e.Price
            arr[0][11] = '' + e.Price
        }
    });

    yesterday.forEach(e => {
        if (e.OilTypeId == 7) {
            arr[1][10] = arr[1][9]
            arr[1][9] = '' + e.Price
        }
        /*if (e.OilTypeId == 1) {
            arr[1][11] = '' + e.Price
        }*/
        if (e.OilTypeId == 22) {
            //arr[1][12] = '' + e.Price
            arr[1][11] = '' + e.Price
        }
    });
    /*yesterday.forEach(e => {
        if (e.OilTypeId == 7) {
            arr[1][10] = arr[1][9]
            arr[1][9] = '' + e.Price
            arr[0][10] = arr[0][9]
            arr[0][9] = '' + e.Price
        }
    });
}else{
    pttarr.forEach(e => {
        if (e.OilTypeId == 7) {
            arr[0][10] = arr[0][9]
            arr[0][9] = '' + e.Price
        }
    });

    yesterday.forEach(e => {
        if (e.OilTypeId == 7) {
            arr[1][10] = arr[1][9]
            arr[1][9] = '' + e.Price
        }
    });
}*/

    //subtract arr[1] from arr[0]
    const arr2 = arr[0].map((e, i) => e - arr[1][i]);
    //console.log(arr2);

    var difftime = Math.abs(date2.getTime() - date1.getTime());
    var diffdays = Math.ceil(difftime / (1000 * 3600 * 24));

    arr2[0] = diffdays;

    //remove NaN
    const arr3 = arr2.filter(e => !isNaN(e));
    //console.log(arr3);

    //format number to 2 decimal
    const arr4 = arr3.map(e => e.toFixed(2));

    //add วัน to arr4[0]
    arr4[0] = parseInt(arr4[0]) + ' วัน';

    //let now = sparray(tr.text());
    //let old = sparray(tr2.text());
    let now = arr[0];
    let old = arr[1];

    console.log('now');
    console.log(now[0]);

    //plus 1 in arr[0][0].substr(0, 2) and arr[1][0].substr(0, 2)
    now[0] = now[0].replace(now[0].substr(0, 2), String(parseInt(now[0].substr(0, 2)) + 1).padStart(2, '0'));
    old[0] = old[0].replace(old[0].substr(0, 2), String(parseInt(old[0].substr(0, 2)) + 1).padStart(2, '0'));

    // pttarr.forEach(e => {
    //     if (e.OilTypeId == 7) {
    //         //now[10] = now[9]
    //         now[11] = '' + e.Price
    //     }
    // });

    // yesterday.forEach(e => {
    //     if (e.OilTypeId == 7) {
    //         //old[10] = old[9]
    //         old[11] = '' + e.Price
    //     }
    // });

    //console.log(pttarr);

    // //move now[5] to back
    // now.push(now[5]);
    // //remove now[5]
    // now.splice(5, 1);
    // //move old[5] to back
    // old.push(old[5]);
    // //remove old[5]
    // old.splice(5, 1);
    // //move arr4[5] to back
    // arr4.push(arr4[5]);
    // //remove arr4[5]
    // arr4.splice(5, 1);
    // console.log('now', now);
    // console.log('old', old);
    // console.log('arr4', arr4);

    //const pttprice = await fetch('https://www.pttor.com/th/oil_price');
    //const pttbody = await pttprice.text();

    //console.log(arr4);
    historical = [now, old, arr4];
    return [now, old, arr4];
}

function sparray(wow) {
    //split into array by new line
    const arr = wow.split('\n');
    //console.log(arr);

    //remove space in each element
    const arr2 = arr.map(e => e.trim());
    //console.log(arr2);

    //remove empty element
    const arr3 = arr2.filter(e => e !== '');
    //console.log(arr3);
    //return arr3 format json
    return arr3;
}

//getData();

// http.createServer(async function (req, res) {
//     if (req.url == '/image') {
//         /*await new Pageres({ format: 'png', delay: 3, filename: 'oilprice', launchOptions: { args: ['--no-sandbox', '--disable-setuid-sandbox', '--no-first-run', '--disable-extensions'] } })
//             .src('https://boyphongsakorn.github.io/thaioilpriceapi/', ['1000x1000'], { crop: true })
//             .dest(__dirname)
//             .run();

//         console.log('Finished generating screenshots!');

//         res.writeHead(200, { 'content-type': 'image/png' });
//         fs.createReadStream('oilprice.png').pipe(res);*/

//         const screenshot = await fetch('https://screenshot-xi.vercel.app/api?url=https://boyphongsakorn.github.io/thaioilpriceapi&width=1000&height=1000')
//         const screenshotbody = await screenshot.buffer();

//         res.writeHead(200, { 'content-type': 'image/png' });
//         res.end(screenshotbody);

//     } else {
//         //get parameter from url
//         const url = new URL(req.url, 'http://localhost:8080');
//         const info = url.searchParams.get('info');
//         console.log(info);
//         let data = await getData();
//         console.log('data', data);
//         let newdata = ["", "", "", "", "", "", "", "", "", ""];

//         //start timer
//         //let start = new Date().getTime();
//         let end;

//         fetch('https://crmmobile.bangchak.co.th/webservice/oil_price.aspx')
//             .then(res => res.text())
//             .then(body => {
//                 end = new Date().getTime();
//                 console.log('finish');
//             })
//             .catch(err => {
//                 end = new Date().getTime();
//                 console.log('finish');
//             });

//         await new Promise(resolve => setTimeout(resolve, 500));
//         //if end is not set it mean fetch is not finish
//         if (!end) {
//             console.log('finish but not');
//             const fromnew = await fetch('https://www.prachachat.net/feed?tag=%E0%B8%A3%E0%B8%B2%E0%B8%84%E0%B8%B2%E0%B8%99%E0%B9%89%E0%B8%B3%E0%B8%A1%E0%B8%B1%E0%B8%99');
//             const fromnewbody = await fromnew.text();
//             const $fromnew = cheerio.load(fromnewbody);
//             //arary item
//             const fromnewitem = $fromnew('item');
//             //console each title
//             fromnewitem.each((i, el) => {
//                 if($fromnew(el).find('title').text().includes('พรุ่งนี้')){
//                     //console.log($fromnew(el).find('title').text());
//                     //console.log($fromnew(el).find('pubDate').text());
//                     //convert from Mon, 21 Nov 2022 10:12:20 +0000 to date
//                     //console.log(new Date($fromnew(el).find('pubDate').text()));
//                     //if new Date($fromnew(el).find('pubDate').text()) same as today
//                     if(new Date($fromnew(el).find('pubDate').text().replace('+0000','+0700')).getDate() == new Date().getDate() && new Date($fromnew(el).find('pubDate').text().replace('+0000','+0700')).getMonth() == new Date().getMonth() && new Date($fromnew(el).find('pubDate').text().replace('+0000','+0700')).getFullYear() == new Date().getFullYear()){
//                     //if(new Date($fromnew(el).find('pubDate').text()) == new Date()){
//                         console.log('new');
//                         const content = $fromnew(el).find('content\\:encoded').html();
//                         //find ul tag in content
//                         const $content = cheerio.load(content);
//                         const ul = $content('ul');
//                         //count ul
//                         if(ul.length > 1){
//                             //console each li tag
//                             ul[0].children.forEach((li) => {
//                                 if(li.name === 'li'){
//                                     //console.log(li.children[0].data);
//                                     if(li.children[0].data.includes('ULG')){
//                                         console.log('ul')
//                                         //console.log(li.children[0].data);
//                                         let ulg = li.children[0].data.replace('ULG', '').replace('=','').replace('บาท','').trim();
//                                         newdata[9] = ulg;
//                                     }
//                                     if(li.children[0].data.includes('GSH95') && newdata[8] == ""){
//                                         console.log('ul')
//                                         //console.log(li.children[0].data);
//                                         let gsh95 = li.children[0].data.replace('GSH95', '').replace('=','').replace('บาท','').trim();
//                                         newdata[8] = gsh95;
//                                     }
//                                     if(li.children[0].data.includes('E20')){
//                                         console.log('ul')
//                                         //console.log(li.children[0].data);
//                                         let e20 = li.children[0].data.replace('E20', '').replace('=','').replace('บาท','').trim();
//                                         newdata[6] = e20;
//                                     }
//                                     if(li.children[0].data.includes('GSH91')){
//                                         console.log('ul')
//                                         //console.log(li.children[0].data);
//                                         let gsh91 = li.children[0].data.replace('GSH91', '').replace('=','').replace('บาท','').trim();
//                                         newdata[7] = gsh91;
//                                     }
//                                     if(li.children[0].data.includes('E85')){
//                                         console.log('ul')
//                                         //console.log(li.children[0].data);
//                                         let e85 = li.children[0].data.replace('E85', '').replace('=','').replace('บาท','').trim();
//                                         newdata[5] = e85;
//                                     }
//                                     if(li.children[0].data.includes('HSD-B7')){
//                                         console.log('ul')
//                                         //console.log(li.children[0].data);
//                                         let hsd = li.children[0].data.replace('HSD-B7', '').replace('=','').replace('บาท','').trim();
//                                         newdata[3] = hsd;
//                                     }
//                                     if(li.children[0].data.includes('HSD-B10')){
//                                         console.log('ul')
//                                         //console.log(li.children[0].data);
//                                         let hsd = li.children[0].data.replace('HSD-B10', '').replace('=','').replace('บาท','').trim();
//                                         newdata[2] = hsd;
//                                     }
//                                     if(li.children[0].data.includes('HSD-B20')){
//                                         console.log('ul')
//                                         //console.log(li.children[0].data);
//                                         let hsd = li.children[0].data.replace('HSD-B20', '').replace('=','').replace('บาท','').trim();
//                                         newdata[4] = hsd;
//                                     }
//                                     if(li.children[0].data.includes('พรีเมี่ยมดีเซล B7')){
//                                         console.log('ul')
//                                         //console.log(li.children[0].data);
//                                         let hsd = li.children[0].data.replace('พรีเมี่ยมดีเซล B7', '').replace('=','').replace('บาท','').trim();
//                                         newdata[1] = hsd;
//                                     }
//                                 }
//                             });
//                         }
//                         //find p tag in content
//                         const p = $content('p').toArray();
//                         //count p
//                         if(p.length > 1){
//                             //loop console each p tag
//                             p.forEach((p) => {
//                                 if($content(p).text().includes('ULG')){
//                                     console.log('p')
//                                     //console.log($content(p).text());
//                                     let ptext = $content(p).text().replace('ULG', '').replace('=','').replace('บาท','').replace(',','').trim();
//                                     newdata[9] = ptext;
//                                 }
//                                 if($content(p).text().includes('GSH95') && newdata[8] == ""){
//                                     console.log('p')
//                                     //console.log($content(p).text());
//                                     let ptext = $content(p).text().replace('GSH95', '').replace('=','').replace('บาท','').replace(',','').trim();
//                                     newdata[8] = ptext;
//                                 }
//                                 if($content(p).text().includes('E20')){
//                                     console.log('p')
//                                     //console.log($content(p).text());
//                                     let ptext = $content(p).text().replace('E20', '').replace('=','').replace('บาท','').replace(',','').trim();
//                                     newdata[4] = ptext;
//                                 }
//                                 if($content(p).text().includes('GSH91')){
//                                     console.log('p')
//                                     //console.log($content(p).text());
//                                     let ptext = $content(p).text().replace('GSH91', '').replace('=','').replace('บาท','').replace(',','').trim();
//                                     newdata[7] = ptext;
//                                 }
//                                 if($content(p).text().includes('E85')){
//                                     console.log('p')
//                                     //console.log($content(p).text());
//                                     let ptext = $content(p).text().replace('E85', '').replace('=','').replace('บาท','').replace(',','').trim();
//                                     newdata[5] = ptext;
//                                 }
//                                 if($content(p).text().includes('HSD-B7')){
//                                     console.log('p')
//                                     //console.log($content(p).text());
//                                     let ptext = $content(p).text().replace('HSD-B7', '').replace('=','').replace('บาท','').replace(',','').trim();
//                                     newdata[3] = ptext;
//                                 }
//                                 if($content(p).text().includes('HSD-B10')){
//                                     console.log('p')
//                                     //console.log($content(p).text());
//                                     let ptext = $content(p).text().replace('HSD-B10', '').replace('=','').replace('บาท','').replace(',','').trim();
//                                     newdata[2] = ptext;
//                                 }
//                                 if($content(p).text().includes('HSD-B20')){
//                                     console.log('p')
//                                     //console.log($content(p).text());
//                                     let ptext = $content(p).text().replace('HSD-B20', '').replace('=','').replace('บาท','').replace(',','').trim();
//                                     newdata[4] = ptext;
//                                 }
//                                 if($content(p).text().includes('พรีเมี่ยมดีเซล B7')){
//                                     console.log('p')
//                                     //console.log($content(p).text());
//                                     let ptext = $content(p).text().replace('พรีเมี่ยมดีเซล B7', '').replace('=','').replace('บาท','').replace(',','').trim();
//                                     newdata[1] = ptext;
//                                 }
//                             });
//                         }
//                     }
//                     newdata[10] = '-';
//                     let date = new Date();
//                     let tomorrowdate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
//                     newdata[0] = (tomorrowdate.getDate()).toString().padStart(2, '0') + '/' + (tomorrowdate.getMonth() + 1).toString().padStart(2, '0') + '/' + (tomorrowdate.getFullYear() + 543);
//                 }
//             })
//         }else{
//             let tmrprice = await fetch('https://crmmobile.bangchak.co.th/webservice/oil_price.aspx')
//             let body = await tmrprice.text();
//             //if tmrprce is 4xx or 5xx
//             if (tmrprice.status >= 400 && tmrprice.status <= 599) {
//                 //if have tmrprice.txt
//                 if (fs.existsSync('/tmp/tmrprice.txt')) {
//                     //body = fs.readFileSync('tmrprice.txt', 'utf8');
//                     body = fs.readFileSync('/tmp/tmrprice.txt', 'utf8');
//                 }else{
//                     newdata[0] = "ไม่สามารถติดต่อกับระบบได้";
//                 }
//             }else{
//                 //write body to tmrprice.txt
//                 fs.writeFileSync('/tmp/tmrprice.txt', body);
//             }

//             /*await fetch('https://crmmobile.bangchak.co.th/webservice/oil_price.aspx')
//                 .then(res => res.text())
//                 .then(body => {*/
//             const $ = cheerio.load(body);

//             let arr = $('update_date').text().split('/');

//             let year = parseInt(arr[2].substring(0, 4)) - 543;

//             let todaydate = new Date(arr[1] + '/' + arr[0] + '/' + year.toString());

//             console.log(arr);
//             console.log(todaydate);
//             //console.log(arr[0])
//             //console.log(arr[1])
//             //console.log(arr[2])

//             //push date/month/year to newdata[0]
//             let date = new Date();

//             //if todaydate is yesterday
//             if (date.getDate() - 1 == todaydate.getDate() && date.getMonth() == todaydate.getMonth() && date.getFullYear() == todaydate.getFullYear()) {
//                 console.log('yesterday');
//                 newdata[0] = (date.getDate()).toString().padStart(2, '0') + '/' + (date.getMonth() + 1).toString().padStart(2, '0') + '/' + (date.getFullYear() + 543);
//             } else {
//                 //tomorrowdate = date + 1 day
//                 let tomorrowdate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
//                 newdata[0] = (tomorrowdate.getDate()).toString().padStart(2, '0') + '/' + (tomorrowdate.getMonth() + 1).toString().padStart(2, '0') + '/' + (tomorrowdate.getFullYear() + 543);
//             }

//             newdata[1] = $('item').eq(0).find('tomorrow').text();
//             newdata[2] = $('item').eq(1).find('tomorrow').text();
//             newdata[3] = $('item').eq(2).find('tomorrow').text();
//             newdata[4] = $('item').eq(3).find('tomorrow').text();
//             newdata[5] = $('item').eq(5).find('tomorrow').text();
//             newdata[6] = $('item').eq(6).find('tomorrow').text();
//             newdata[7] = $('item').eq(7).find('tomorrow').text();
//             newdata[8] = $('item').eq(8).find('tomorrow').text();
//             newdata[9] = '-';
//             newdata[10] = $('item').eq(4).find('tomorrow').text();
//         }

//         //get time in ms
//         //let time = end - start;
//         //console time
//         //console.log('time', time);
//         //console time in second
//         //console.log('time', time / 1000);

//         //log every item tag

//         /*$('item').each(function(i, elem) {
//             console.log($(this).find('type').text());
//             console.log($(this).find('today').text());
//             console.log($(this).find('tomorrow').text());
//             console.log($(this).find('yesterday').text());
//         });*/
//         //});

//         console.log(newdata);

//         //get count of difference between newdata and data[0]
//         let count = 0;
//         for (let i = 0; i < newdata.length; i++) {
//             if (newdata[i] !== data[0][i]) {
//                 count++;
//             }
//         }
//         console.log(count);

//         //if count > 1, then set data[1] = data[0] and set data[0] = newdata
//         if (count > 9) {
//             data[1] = data[0];
//             data[0] = newdata;
//             let comefromnew = false;

//             if(data[0][9] == '-'){
//                 const fromnew = await fetch('https://www.prachachat.net/feed?tag=%E0%B8%A3%E0%B8%B2%E0%B8%84%E0%B8%B2%E0%B8%99%E0%B9%89%E0%B8%B3%E0%B8%A1%E0%B8%B1%E0%B8%99');
//                 const fromnewbody = await fromnew.text();
//                 const $fromnew = cheerio.load(fromnewbody);
//                 //arary item
//                 const fromnewitem = $fromnew('item');
//                 //console each title
//                 fromnewitem.each((i, el) => {
//                     if($fromnew(el).find('title').text().includes('พรุ่งนี้')){
//                         //console.log($fromnew(el).find('title').text());
//                         //console.log($fromnew(el).find('pubDate').text());
//                         //convert from Mon, 21 Nov 2022 10:12:20 +0000 to date
//                         //console.log(new Date($fromnew(el).find('pubDate').text()));
//                         //if new Date($fromnew(el).find('pubDate').text()) same as today
//                         if(new Date($fromnew(el).find('pubDate').text().replace('+0000','+0700')).getDate() == new Date().getDate() && new Date($fromnew(el).find('pubDate').text().replace('+0000','+0700')).getMonth() == new Date().getMonth() && new Date($fromnew(el).find('pubDate').text().replace('+0000','+0700')).getFullYear() == new Date().getFullYear()){
//                         //if(new Date($fromnew(el).find('pubDate').text()) == new Date()){
//                             console.log('new');
//                             const content = $fromnew(el).find('content\\:encoded').html();
//                             //find ul tag in content
//                             const $content = cheerio.load(content);
//                             const ul = $content('ul');
//                             //count ul
//                             if(ul.length > 1){
//                                 //console each li tag
//                                 ul[0].children.forEach((li) => {
//                                     if(li.name === 'li'){
//                                         //console.log(li.children[0].data);
//                                         if(li.children[0].data.includes('ULG')){
//                                             console.log('ul')
//                                             //console.log(li.children[0].data);
//                                             let ulg = li.children[0].data.replace('ULG', '').replace('=','').replace('บาท','').trim();
//                                             data[0][10] = data[0][9];
//                                             data[0][9] = ulg;
//                                             comefromnew = true;
//                                         }
//                                     }
//                                 });
//                             }
//                             //find p tag in content
//                             const p = $content('p').toArray();
//                             //count p
//                             if(p.length > 1){
//                                 //loop console each p tag
//                                 p.forEach((p) => {
//                                     if($content(p).text().includes('ULG')){
//                                         console.log('p')
//                                         //console.log($content(p).text());
//                                         let ptext = $content(p).text().replace('ULG', '').replace('=','').replace('บาท','').replace(',','').trim();
//                                         data[0][10] = data[0][9];
//                                         data[0][9] = ptext;
//                                         comefromnew = true;
//                                     }
//                                 });
//                             }
//                         }
//                     }
//                 })

//                 if(comefromnew === false){
//                     data[0][10] = data[0][9];
//                     data[0][9] = parseFloat(data[1][9]) + parseFloat(data[2][8]);
//                 }
//             }else{
//                 comefromnew = true;
//             }

//             //subtract data[1] from data[0] and set to data[2]
//             data[2] = data[0].map((e, i) => e - data[1][i]);
//             //format number to 2 decimal
//             data[2] = data[2].map(e => e.toFixed(2));

//             if(comefromnew === false){
//                 data[0][9] = '~' + data[0][9];
//             }

//             var date1 = new Date(data[0][0].substr(3, 2) + '/' + data[0][0].substr(0, 2) + '/' + (parseInt(data[0][0].substr(6, 4)) - 543));
//             var date2 = new Date(data[1][0].substr(3, 2) + '/' + data[1][0].substr(0, 2) + '/' + (parseInt(data[1][0].substr(6, 4)) - 543));
//             console.log(date1);
//             console.log(date2);

//             var difftime = Math.abs(date2.getTime() - date1.getTime());
//             var diffdays = Math.ceil(difftime / (1000 * 3600 * 24));

//             data[2][0] = diffdays + ' วัน';

//             //remove last element of data[2]
//             data[2].pop();
//         }

//         let newway;

//         if(info === 'true'){
//             newway = {
//                 'info': {
//                     'lastupdate': data[0][0],
//                     'beforeupdate': data[1][0],
//                     'diffdays': data[2][0]
//                 },
//                 'Premium Diesel B7': {
//                     'latest': data[0][1],
//                     'before': data[1][1],
//                     'change': data[2][1]
//                 },
//                 'Diesel B10': {
//                     'latest': data[0][2],
//                     'before': data[1][2],
//                     'change': data[2][2]
//                 },
//                 'Normal Diesel': {
//                     'latest': data[0][3],
//                     'before': data[1][3],
//                     'change': data[2][3]
//                 },
//                 'Diesel B20': {
//                     'latest': data[0][4],
//                     'before': data[1][4],
//                     'change': data[2][4]
//                 },
//                 'Gasohol E85': {
//                     'latest': data[0][5],
//                     'before': data[1][5],
//                     'change': data[2][5]
//                 },
//                 'Gasohol E20': {
//                     'latest': data[0][6],
//                     'before': data[1][6],
//                     'change': data[2][6]
//                 },
//                 'Gasohol 91': {
//                     'latest': data[0][7],
//                     'before': data[1][7],
//                     'change': data[2][7]
//                 },
//                 'Gasohol 95': {
//                     'latest': data[0][8],
//                     'before': data[1][8],
//                     'change': data[2][8]
//                 },
//                 'ULG': {
//                     'latest': data[0][9],
//                     'before': data[1][9],
//                     'change': data[2][9]
//                 },
//                 'Hi Premium 97 Gasohol 95': {
//                     'latest': data[0][10],
//                     'before': data[1][10],
//                     'change': data[2][10]
//                 }
//             }
//         }

//         //writehead json
//         res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
//         if(info === 'true'){
//             res.write(JSON.stringify(newway));
//         }else{
//             res.write(JSON.stringify(data));
//         }
//         res.end();
//     }
// }).listen(port);

fastify.get('/', async (request, reply) => {
    //return { hello: 'world' }
    //get parameter from url
    //const url = new URL(req.url, 'http://localhost:8080');
    //const info = url.searchParams.get('info');
    const info = request.query.info;
    console.log(info);
    let data = await getData();
    console.log('data', data);
    let newdata = ["", "", "", "", "", "", "", "", "", "", "", "", ""];
    let newdata2 = ["", "", "", "", "", "", "", "", "", "", "", "", ""];

    //start timer
    //let start = new Date().getTime();
    let end;

    //fetch('https://crmmobile.bangchak.co.th/webservice/oil_price.aspx')
    /*await fetch('https://www.bangchak.co.th/api/oilprice')
        //.then(res => res.text())
        .then(res => res.json())
        .then(body => {
            end = new Date().getTime();
            console.log('finish');
        })
        .catch(err => {
            end = new Date().getTime();
            console.log('finish');
        });*/

    //await new Promise(resolve => setTimeout(resolve, 500));
    //if end is not set it mean fetch is not finish
    //if (!end) {
    //console.log('finish but not');
    const fromnew = await fetch('https://www.prachachat.net/feed?tag=%E0%B8%A3%E0%B8%B2%E0%B8%84%E0%B8%B2%E0%B8%99%E0%B9%89%E0%B8%B3%E0%B8%A1%E0%B8%B1%E0%B8%99');
    const fromnewbody = await fromnew.text();
    const $fromnew = cheerio.load(fromnewbody);
    //arary item
    const fromnewitem = $fromnew('item');
    //console each title
    fromnewitem.each((i, el) => {
        if ($fromnew(el).find('title').text().includes('พรุ่งนี้')) {
            //console.log($fromnew(el).find('title').text());
            //console.log($fromnew(el).find('pubDate').text());
            //convert from Mon, 21 Nov 2022 10:12:20 +0000 to date
            //console.log(new Date($fromnew(el).find('pubDate').text()));
            //if new Date($fromnew(el).find('pubDate').text()) same as today
            if (new Date($fromnew(el).find('pubDate').text().replace('+0000', '+0700')).getDate() == new Date().getDate() && new Date($fromnew(el).find('pubDate').text().replace('+0000', '+0700')).getMonth() == new Date().getMonth() && new Date($fromnew(el).find('pubDate').text().replace('+0000', '+0700')).getFullYear() == new Date().getFullYear()) {
                //if(new Date($fromnew(el).find('pubDate').text()) == new Date()){
                console.log('new');
                const content = $fromnew(el).find('content\\:encoded').html();
                //find ul tag in content
                const $content = cheerio.load(content);
                const ul = $content('ul');
                //count ul
                if (ul.length > 1) {
                    //console each li tag
                    ul[0].children.forEach((li) => {
                        if (li.name === 'li') {
                            //console.log(li.children[0].data);
                            if (li.children[0].data.includes('ULG')) {
                                console.log('ul')
                                //console.log(li.children[0].data);
                                let ulg = li.children[0].data.replace('ULG', '').replace('=', '').replace('บาท', '').trim();
                                //newdata[9] = ulg;
                                newdata2[9] = ulg;
                            }
                            if (li.children[0].data.includes('GSH95') && newdata[8] == "" && li.children[0].data.includes('พรีเมี่ยม GSH95') == false) {
                                console.log('ul')
                                //console.log(li.children[0].data);
                                let gsh95 = li.children[0].data.replace('GSH95', '').replace('=', '').replace('บาท', '').trim();
                                //newdata[8] = gsh95;
                                newdata2[8] = gsh95;
                            }
                            if (li.children[0].data.includes('E20')) {
                                console.log('ul')
                                //console.log(li.children[0].data);
                                let e20 = li.children[0].data.replace('E20', '').replace('=', '').replace('บาท', '').trim();
                                //newdata[6] = e20;
                                newdata2[6] = e20;
                            }
                            if (li.children[0].data.includes('GSH91')) {
                                console.log('ul')
                                //console.log(li.children[0].data);
                                let gsh91 = li.children[0].data.replace('GSH91', '').replace('=', '').replace('บาท', '').trim();
                                //newdata[7] = gsh91;
                                newdata2[7] = gsh91;
                            }
                            if (li.children[0].data.includes('E85')) {
                                console.log('ul')
                                //console.log(li.children[0].data);
                                let e85 = li.children[0].data.replace('E85', '').replace('=', '').replace('บาท', '').trim();
                                //newdata[5] = e85;
                                newdata2[5] = e85;
                            }
                            if (li.children[0].data.includes('HSD-B7')) {
                                console.log('ul')
                                //console.log(li.children[0].data);
                                let hsd = li.children[0].data.replace('HSD-B7', '').replace('=', '').replace('บาท', '').trim();
                                //newdata[3] = hsd;
                                newdata2[3] = hsd;
                            }
                            if (li.children[0].data.includes('HSD-B10')) {
                                console.log('ul')
                                //console.log(li.children[0].data);
                                let hsd = li.children[0].data.replace('HSD-B10', '').replace('=', '').replace('บาท', '').trim();
                                //newdata[2] = hsd;
                                newdata2[2] = hsd;
                            }
                            if (li.children[0].data.includes('HSD-B20')) {
                                console.log('ul')
                                //console.log(li.children[0].data);
                                let hsd = li.children[0].data.replace('HSD-B20', '').replace('=', '').replace('บาท', '').trim();
                                //newdata[4] = hsd;
                                newdata2[4] = hsd;
                            }
                            if (li.children[0].data.includes('พรีเมี่ยมดีเซล B7')) {
                                console.log('ul')
                                //console.log(li.children[0].data);
                                let hsd = li.children[0].data.replace('พรีเมี่ยมดีเซล B7', '').replace('=', '').replace('บาท', '').trim();
                                //newdata[1] = hsd;
                                newdata2[1] = hsd;
                            }
                            if (li.children[0].data.includes('พรีเมี่ยม GSH95')) {
                                console.log('ul')
                                //console.log(li.children[0].data);
                                let hsd = li.children[0].data.replace('พรีเมี่ยม GSH95', '').replace('=', '').replace('บาท', '').trim();
                                //newdata[11] = hsd;
                                newdata2[11] = hsd;
                            }
                        }
                    });
                    ul[1].children.forEach((li) => {
                        if (li.name === 'li') {
                            if (li.children[0].data.includes('Hi Premium 97 (GSH95++)')) {
                                console.log('ul')
                                //console.log(li.children[0].data);
                                let gsh95 = li.children[0].data.replace('Hi Premium 97 (GSH95++)', '').replace('=', '').replace('บาท', '').trim();
                                //newdata[8] = gsh95;
                                newdata2[10] = gsh95;
                            }
                        }
                    });
                }
                //find p tag in content
                const p = $content('p').toArray();
                //count p
                if (p.length > 1) {
                    //loop console each p tag
                    p.forEach((p) => {
                        if ($content(p).text().includes('ULG')) {
                            console.log('p')
                            //console.log($content(p).text());
                            let ptext = $content(p).text().replace('ULG', '').replace('=', '').replace('บาท', '').replace(',', '').trim();
                            //newdata[9] = ptext;
                            newdata2[9] = ptext;
                        }
                        if ($content(p).text().includes('GSH95') && newdata[8] == "") {
                            console.log('p')
                            //console.log($content(p).text());
                            let ptext = $content(p).text().replace('GSH95', '').replace('=', '').replace('บาท', '').replace(',', '').trim();
                            //newdata[8] = ptext;
                            newdata2[8] = ptext;
                        }
                        if ($content(p).text().includes('E20')) {
                            console.log('p')
                            //console.log($content(p).text());
                            let ptext = $content(p).text().replace('E20', '').replace('=', '').replace('บาท', '').replace(',', '').trim();
                            //newdata[4] = ptext;
                            //newdata2[4] = ptext;
                            newdata2[6] = ptext;
                        }
                        if ($content(p).text().includes('GSH91')) {
                            console.log('p')
                            //console.log($content(p).text());
                            let ptext = $content(p).text().replace('GSH91', '').replace('=', '').replace('บาท', '').replace(',', '').trim();
                            //newdata[7] = ptext;
                            newdata2[7] = ptext;
                        }
                        if ($content(p).text().includes('E85')) {
                            console.log('p')
                            //console.log($content(p).text());
                            let ptext = $content(p).text().replace('E85', '').replace('=', '').replace('บาท', '').replace(',', '').trim();
                            //newdata[5] = ptext;
                            newdata2[5] = ptext;
                        }
                        if ($content(p).text().includes('HSD-B7')) {
                            console.log('p')
                            //console.log($content(p).text());
                            let ptext = $content(p).text().replace('HSD-B7', '').replace('=', '').replace('บาท', '').replace(',', '').trim();
                            //newdata[3] = ptext;
                            newdata2[3] = ptext;
                        }
                        if ($content(p).text().includes('HSD-B10')) {
                            console.log('p')
                            //console.log($content(p).text());
                            let ptext = $content(p).text().replace('HSD-B10', '').replace('=', '').replace('บาท', '').replace(',', '').trim();
                            //newdata[2] = ptext;
                            newdata2[2] = ptext;
                        }
                        if ($content(p).text().includes('HSD-B20')) {
                            console.log('p')
                            //console.log($content(p).text());
                            let ptext = $content(p).text().replace('HSD-B20', '').replace('=', '').replace('บาท', '').replace(',', '').trim();
                            //newdata[4] = ptext;
                            newdata2[4] = ptext;
                        }
                        if ($content(p).text().includes('พรีเมี่ยมดีเซล B7')) {
                            console.log('p')
                            //console.log($content(p).text());
                            let ptext = $content(p).text().replace('พรีเมี่ยมดีเซล B7', '').replace('=', '').replace('บาท', '').replace(',', '').trim();
                            //newdata[1] = ptext;
                            newdata2[1] = ptext;
                        }
                        if ($content(p).text().includes('พรีเมี่ยม GSH95')) {
                            console.log('p')
                            //console.log($content(p).text());
                            let ptext = $content(p).text().replace('พรีเมี่ยม GSH95', '').replace('=', '').replace('บาท', '').replace(',', '').trim();
                            //newdata[11] = ptext;
                            newdata2[11] = ptext;
                        }
                        if ($content(p).text().includes('Hi Premium 97 (GSH95++)')) {
                            console.log('p')
                            //console.log($content(p).text());
                            let ptext = $content(p).text().replace('Hi Premium 97 (GSH95++)', '').replace('=', '').replace('บาท', '').replace(',', '').trim();
                            //newdata[8] = ptext;
                            newdata2[10] = ptext;
                        }
                    });
                }
                let date = new Date($fromnew(el).find('pubDate').text());
                let tomorrowdate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
                //newdata[0] = (tomorrowdate.getDate()).toString().padStart(2, '0') + '/' + (tomorrowdate.getMonth() + 1).toString().padStart(2, '0') + '/' + (tomorrowdate.getFullYear() + 543);
                newdata2[0] = (tomorrowdate.getDate()).toString().padStart(2, '0') + '/' + (tomorrowdate.getMonth() + 1).toString().padStart(2, '0') + '/' + (tomorrowdate.getFullYear() + 543);
            }
            //newdata[10] = '-';
            //newdata2[10] = '-';
        }
    })
    //}else{
    //let tmrprice = await fetch('https://crmmobile.bangchak.co.th/webservice/oil_price.aspx')
    //let body = await tmrprice.text();
    let tmrprice = await fetch('https://www.bangchak.co.th/api/oilprice')
    let body = await tmrprice.json();
    console.log(tmrprice.status)
    //if tmrprce is 4xx or 5xx
    /*if (tmrprice.status >= 400 && tmrprice.status <= 599) {
        //if have tmrprice.txt
        if (fs.existsSync('/tmp/tmrprice.txt')) {
            //body = fs.readFileSync('tmrprice.txt', 'utf8');
            body = JSON.parse(fs.readFileSync('/tmp/tmrprice.txt', 'utf8'));
        }else{
            newdata[0] = "ไม่สามารถติดต่อกับระบบได้";
        }
    }else{
        //write body to tmrprice.txt
        fs.writeFileSync('/tmp/tmrprice.txt', JSON.stringify(body));
    }*/

    /*await fetch('https://crmmobile.bangchak.co.th/webservice/oil_price.aspx')
        .then(res => res.text())
        .then(body => {*/
    //const $ = cheerio.load(body);

    //let arr = $('update_date').text().split('/');
    console.log('from json')
    console.log(body);
    console.log(body.data.remark_en);

    //find all text month in body.data.remark_en
    let month = body.data.remark_en.match(/January|February|March|April|May|June|July|August|September|October|November|December/g);
    console.log(month);
    //split body.data.remark_en by space
    let arr = body.data.remark_en.split(' ');
    //find index of month in arr
    let index = arr.indexOf(month[0]);
    //get before index of month and after index of month
    let before = arr[index - 1];
    let after = arr[index + 1];
    //change month to number
    let monthnum = '';
    switch (month[0]) {
        case 'January':
            monthnum = '01';
            break;
        case 'February':
            monthnum = '02';
            break;
        case 'March':
            monthnum = '03';
            break;
        case 'April':
            monthnum = '04';
            break;
        case 'May':
            monthnum = '05';
            break;
        case 'June':
            monthnum = '06';
            break;
        case 'July':
            monthnum = '07';
            break;
        case 'August':
            monthnum = '08';
            break;
        case 'September':
            monthnum = '09';
            break;
        case 'October':
            monthnum = '10';
            break;
        case 'November':
            monthnum = '11';
            break;
        case 'December':
            monthnum = '12';
            break;
    }

    //let year = parseInt(arr[2].substring(0, 4)) - 543;
    let year = parseInt(after);

    //let todaydate = new Date(arr[1] + '/' + arr[0] + '/' + year.toString());
    let todaydate = new Date(monthnum + '/' + before + '/' + year.toString());

    //console.log(arr);
    console.log(todaydate);
    //console.log(arr[0])
    //console.log(arr[1])
    //console.log(arr[2])

    //push date/month/year to newdata[0]
    let date = new Date();

    //if todaydate is yesterday
    if (date.getDate() - 1 == todaydate.getDate() && date.getMonth() == todaydate.getMonth() && date.getFullYear() == todaydate.getFullYear()) {
        console.log('yesterday');
        newdata[0] = (date.getDate()).toString().padStart(2, '0') + '/' + (date.getMonth() + 1).toString().padStart(2, '0') + '/' + (date.getFullYear() + 543);
    } else {
        //tomorrowdate = date + 1 day
        let tomorrowdate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        newdata[0] = (tomorrowdate.getDate()).toString().padStart(2, '0') + '/' + (tomorrowdate.getMonth() + 1).toString().padStart(2, '0') + '/' + (tomorrowdate.getFullYear() + 543);
    }

    /*newdata[1] = $('item').eq(0).find('tomorrow').text();
    newdata[2] = $('item').eq(1).find('tomorrow').text();
    newdata[3] = $('item').eq(2).find('tomorrow').text();
    newdata[4] = $('item').eq(3).find('tomorrow').text();
    newdata[5] = $('item').eq(5).find('tomorrow').text();
    newdata[6] = $('item').eq(6).find('tomorrow').text();
    newdata[7] = $('item').eq(7).find('tomorrow').text();
    newdata[8] = $('item').eq(8).find('tomorrow').text();
    //newdata[9] = '-';
    newdata[9] = $('item').eq(4).find('tomorrow').text();*/
    newdata[1] = body.data.items[0].PriceTomorrow.toString();
    newdata[2] = body.data.items[1].PriceTomorrow.toString();
    newdata[3] = body.data.items[2].PriceTomorrow.toString();
    newdata[4] = body.data.items[3].PriceTomorrow.toString();
    newdata[5] = body.data.items[5].PriceTomorrow.toString();
    newdata[6] = body.data.items[6].PriceTomorrow.toString();
    newdata[7] = body.data.items[7].PriceTomorrow.toString();
    newdata[8] = body.data.items[8].PriceTomorrow.toString();
    //newdata[9] = body.data.items[4].PriceTomorrow.toString();
    newdata[10] = body.data.items[4].PriceTomorrow.toString();

    //if todaydate < real today
    if (todaydate < date) {
        console.log('wrong date');
        //set newdata to data[0]
        newdata = data[0];
    }
    //}

    //convert text newdata2[0] and newdata[0] to date
    let newdate1 = newdata2[0].split('/');
    let newdate1date = new Date(newdate1[2] - 543, newdate1[1] - 1, newdate1[0]);
    let newdate2 = newdata[0].split('/');
    let newdate2date = new Date(newdate2[2] - 543, newdate2[1] - 1, newdate2[0]);
    //if newdate1date > newdate2date
    let comefromnew = false;
    if (newdate2date != newdate1date) {
        if (newdate1date > newdate2date) {
            //set newdata2 to newdata
            console.log(newdate1date);
            console.log(newdate2date);
            newdata = newdata2;
            console.log('newdata2');
            comefromnew = true;
        }
    }

    //get time in ms
    //let time = end - start;
    //console time
    //console.log('time', time);
    //console time in second
    //console.log('time', time / 1000);

    //log every item tag

    /*$('item').each(function(i, elem) {
        console.log($(this).find('type').text());
        console.log($(this).find('today').text());
        console.log($(this).find('tomorrow').text());
        console.log($(this).find('yesterday').text());
    });*/
    //});

    console.log(newdata);

    //get count of difference between newdata and data[0]
    let count = 0;
    for (let i = 0; i < newdata.length; i++) {
        if (newdata[i] !== data[0][i]) {
            count++;
        }
    }
    console.log(count);

    //if count > 1, then set data[1] = data[0] and set data[0] = newdata
    if (count > 2) {
        data[1] = data[0];
        data[0] = newdata;

        //if(data[0][9] == '-'){
        if (comefromnew === false) {
            const fromnew = await fetch('https://www.prachachat.net/feed?tag=%E0%B8%A3%E0%B8%B2%E0%B8%84%E0%B8%B2%E0%B8%99%E0%B9%89%E0%B8%B3%E0%B8%A1%E0%B8%B1%E0%B8%99');
            const fromnewbody = await fromnew.text();
            const $fromnew = cheerio.load(fromnewbody);
            //arary item
            const fromnewitem = $fromnew('item');
            //console each title
            fromnewitem.each((i, el) => {
                if ($fromnew(el).find('title').text().includes('พรุ่งนี้')) {
                    //console.log($fromnew(el).find('title').text());
                    //console.log($fromnew(el).find('pubDate').text());
                    //convert from Mon, 21 Nov 2022 10:12:20 +0000 to date
                    //console.log(new Date($fromnew(el).find('pubDate').text()));
                    //if new Date($fromnew(el).find('pubDate').text()) same as today
                    if (new Date($fromnew(el).find('pubDate').text().replace('+0000', '+0700')).getDate() == new Date().getDate() && new Date($fromnew(el).find('pubDate').text().replace('+0000', '+0700')).getMonth() == new Date().getMonth() && new Date($fromnew(el).find('pubDate').text().replace('+0000', '+0700')).getFullYear() == new Date().getFullYear()) {
                        //if(new Date($fromnew(el).find('pubDate').text()) == new Date()){
                        console.log('new');
                        const content = $fromnew(el).find('content\\:encoded').html();
                        //find ul tag in content
                        const $content = cheerio.load(content);
                        const ul = $content('ul');
                        //count ul
                        if (ul.length > 1) {
                            //console each li tag
                            ul[0].children.forEach((li) => {
                                if (li.name === 'li') {
                                    //console.log(li.children[0].data);
                                    if (li.children[0].data.includes('ULG')) {
                                        console.log('ul')
                                        //console.log(li.children[0].data);
                                        let ulg = li.children[0].data.replace('ULG', '').replace('=', '').replace('บาท', '').trim();
                                        //data[0][10] = data[0][9];
                                        data[0][9] = ulg;
                                        comefromnew = true;
                                    }
                                    if (li.children[0].data.includes('พรีเมี่ยม GSH95')) {
                                        console.log('ul')
                                        //console.log(li.children[0].data);
                                        let gsh95 = li.children[0].data.replace('พรีเมี่ยม GSH95', '').replace('=', '').replace('บาท', '').trim();
                                        data[0][11] = gsh95;
                                        comefromnew = true;
                                    }
                                }
                            });
                        }
                        //find p tag in content
                        const p = $content('p').toArray();
                        //count p
                        if (p.length > 1) {
                            //loop console each p tag
                            p.forEach((p) => {
                                if ($content(p).text().includes('ULG')) {
                                    console.log('p')
                                    //console.log($content(p).text());
                                    let ptext = $content(p).text().replace('ULG', '').replace('=', '').replace('บาท', '').replace(',', '').trim();
                                    data[0][10] = data[0][9];
                                    data[0][9] = ptext;
                                    comefromnew = true;
                                }
                                if ($content(p).text().includes('พรีเมี่ยม GSH95')) {
                                    console.log('p')
                                    //console.log($content(p).text());
                                    let ptext = $content(p).text().replace('พรีเมี่ยม GSH95', '').replace('=', '').replace('บาท', '').replace(',', '').trim();
                                    data[0][11] = ptext;
                                    comefromnew = true;
                                }
                            });
                        }
                    }
                }
            })

            if (comefromnew === false) {
                //data[0][10] = data[0][9];
                data[0][9] = parseFloat(data[1][9]) + parseFloat(data[2][6]);
                data[0][11] = parseFloat(data[1][11]) + parseFloat(data[2][6]);
                //get only 2 decimal
                data[0][9] = data[0][9].toFixed(2);
                data[0][11] = data[0][11].toFixed(2);
            }
        }
        //}else{
        //    comefromnew = true;
        //}

        //subtract data[1] from data[0] and set to data[2]
        data[2] = data[0].map((e, i) => e - data[1][i]);
        //format number to 2 decimal
        data[2] = data[2].map(e => e.toFixed(2));

        if (comefromnew === false) {
            data[0][9] = parseFloat(data[1][9]) + parseFloat(data[2][6]);
            data[0][11] = parseFloat(data[1][11]) + parseFloat(data[2][6]);

            data[0][9] = data[0][9].toFixed(2);
            data[0][11] = data[0][11].toFixed(2);

            //reroll data[2]
            data[2] = data[0].map((e, i) => e - data[1][i]);
            //format number to 2 decimal
            data[2] = data[2].map(e => e.toFixed(2));

            data[0][9] = '~' + data[0][9];
            data[0][11] = '~' + data[0][11];
        }

        var date1 = new Date(data[0][0].substr(3, 2) + '/' + data[0][0].substr(0, 2) + '/' + (parseInt(data[0][0].substr(6, 4)) - 543));
        var date2 = new Date(data[1][0].substr(3, 2) + '/' + data[1][0].substr(0, 2) + '/' + (parseInt(data[1][0].substr(6, 4)) - 543));
        console.log(date1);
        console.log(date2);

        var difftime = Math.abs(date2.getTime() - date1.getTime());
        var diffdays = Math.ceil(difftime / (1000 * 3600 * 24));

        data[2][0] = diffdays + ' วัน';

        //remove last element of data[2]
        //data[2].pop();
    }

    //if data[0] length > 12 then remove after 12
    if (data[0].length > 12) {
        data[0].splice(12, data[0].length - 12);
        data[2].splice(12, data[2].length - 12);
    }
    if (data[1].length > 12) {
        data[1].splice(12, data[1].length - 12);
        data[2].splice(12, data[2].length - 12);
    }

    let newway;

    if (info === 'true') {
        newway = {
            'info': {
                'lastupdate': data[0][0],
                'beforeupdate': data[1][0],
                'diffdays': data[2][0]
            },
            'Premium Diesel B7': {
                'latest': data[0][1],
                'before': data[1][1],
                'change': data[2][1]
            },
            'Diesel B10': {
                'latest': data[0][2],
                'before': data[1][2],
                'change': data[2][2]
            },
            'Normal Diesel': {
                'latest': data[0][3],
                'before': data[1][3],
                'change': data[2][3]
            },
            'Diesel B20': {
                'latest': data[0][4],
                'before': data[1][4],
                'change': data[2][4]
            },
            'Gasohol E85': {
                'latest': data[0][5],
                'before': data[1][5],
                'change': data[2][5]
            },
            'Gasohol E20': {
                'latest': data[0][6],
                'before': data[1][6],
                'change': data[2][6]
            },
            'Gasohol 91': {
                'latest': data[0][7],
                'before': data[1][7],
                'change': data[2][7]
            },
            'Gasohol 95': {
                'latest': data[0][8],
                'before': data[1][8],
                'change': data[2][8]
            },
            'ULG': {
                'latest': data[0][9],
                'before': data[1][9],
                'change': data[2][9]
            },
            'Hi Premium 97 Gasohol 95': {
                'latest': data[0][10],
                'before': data[1][10],
                'change': data[2][10]
            },
            /*'Super Power Diesel B7': {
                'latest': data[0][11],
                'before': data[1][11],
                'change': data[2][11]
            },*/
            'Super Power Gasohol 95': {
                //'latest': data[0][12],
                //'before': data[1][12],
                //'change': data[2][12]
                'latest': data[0][11],
                'before': data[1][11],
                'change': data[2][11]
            }
        }
    }

    //reply header accept only boyphongsakorn.github.io
    //reply.header('Access-Control-Allow-Origin', 'https://boyphongsakorn.github.io');
    //for test
    reply.header('Access-Control-Allow-Origin', '*');
    //writehead json
    //res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    if (info === 'true') {
        //res.write(JSON.stringify(newway));
        return newway;
    } else {
        //res.write(JSON.stringify(data));
        return data;
    }
    //res.end();
})

fastify.get('/image', async (req, res) => {
    /*await new Pageres({ format: 'png', delay: 3, filename: 'oilprice', launchOptions: { args: ['--no-sandbox', '--disable-setuid-sandbox', '--no-first-run', '--disable-extensions'] } })
            .src('https://boyphongsakorn.github.io/thaioilpriceapi/', ['1000x1000'], { crop: true })
            .dest(__dirname)
            .run();

        console.log('Finished generating screenshots!');

        res.writeHead(200, { 'content-type': 'image/png' });
        fs.createReadStream('oilprice.png').pipe(res);*/

    let location

    const check = await fetch('https://anywhere.pwisetthon.com/https://thaioilpriceapi-vercel.vercel.app?info=true');
    const checkbody = await check.json();
    //write info.lastupdate to file
    try {
        fs.writeFileSync('test.txt', checkbody.info.lastupdate);
        location = ''
    } catch (error) {
        fs.writeFileSync('/tmp/test.txt', checkbody.info.lastupdate);
        location = '/tmp/'
    }
    if(fs.existsSync(location + 'lastupdate.txt') === false){
        try {
            fs.writeFileSync('lastupdate.txt', checkbody.info.lastupdate);
            location = ''
        } catch (error) {
            fs.writeFileSync('/tmp/lastupdate.txt', checkbody.info.lastupdate);
            location = '/tmp/'
        }
    } else {
        if(checkbody.info.lastupdate !== fs.readFileSync(location + 'lastupdate.txt', 'utf8')) {
            fs.writeFileSync('lastupdate.txt', checkbody.info.beforeupdate);
        }
    }
    //check if have a image file
    let imageexist = false;
    try {
        if (fs.existsSync(location + 'oilprice.png')) {
            //file exists
            imageexist = true;
        } else {
            //file not exists
            imageexist = false;
        }
    } catch (err) {
        console.log(err)
        imageexist = false;
    }

    if (imageexist && checkbody.info.lastupdate === fs.readFileSync(location + 'lastupdate.txt', 'utf8')) {
        //read image file and send
        res.header('content-type', 'image/png');
        //try {
        //fs.createReadStream(location+'oilprice.png').pipe(res);
        //} catch (error) {
        //fs.createReadStream('/tmp/oilprice.png').pipe(res);
        //}
        //read file and return
        return fs.readFileSync(location + 'oilprice.png')
    } else {
        const screenshot = await fetch('https://screenshot-xi.vercel.app/api?url=https://boyphongsakorn.github.io/thaioilpriceapi&width=1000&height=1000')
        const screenshotbody = await screenshot.buffer();
        //write image file
        if(screenshotbody.length > 1000){
            try {
                fs.writeFileSync('oilprice.png', screenshotbody);
            } catch (error) {
                fs.writeFileSync('/tmp/oilprice.png', screenshotbody);
            }
        }
        //send image
        res.header('content-type', 'image/png');
        return screenshotbody;
    }

    //res.writeHead(200, { 'content-type': 'image/png' });
    //res.end(screenshotbody);
    //res.type('image/png').send(
    //    screenshotbody
    //)
    //return screenshotbody;
})

const start = async () => {
    try {
        await fastify.listen({ port: port, host: '0.0.0.0' })
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}

start()