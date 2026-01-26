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

const AbortController = globalThis.AbortController

let historical = [];

async function getData() {
    let body = "";
    let arr = [];

    var date1 = new Date(new Date().getFullYear(), new Date().getMonth() - 1, new Date().getDate());
    var date2 = new Date();

    try {
        const response = await fetch('https://www.bangchak.co.th/th/oilprice/historical');
        body = await response.text();

        //console.log(body);
        const $ = cheerio.load(body);

        //console first tr inside tbody
        let tr = $('tbody tr').first();
        //console.log(tr.text());

        //console.log(sparray(tr.text()));

        //console second tr inside tbody
        let tr2 = $('tbody tr').eq(1);
        //get last tbody tr
        //tr = $('tbody tr').last();
        //get before last tbody tr
        //tr2 = $('tbody tr').eq($('tbody tr').length - 2);
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
        arr = [sparray(tr.text()), sparray(tr2.text())];

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
        date1 = new Date(arr[0][0].substr(3, 2) + '/' + arr[0][0].substr(0, 2) + '/' + (parseInt(arr[0][0].substr(6, 4)) - 543));
        if(arr[1][0] == undefined) {
            const responselastyear = await fetch('https://www.bangchak.co.th/th/oilprice/historical?year=' + (new Date().getFullYear() - 1));
            body = await responselastyear.text();

            const $two = cheerio.load(body);
            tr2 = $two('tbody tr').first();

            for (let i = 0; i < sparray(tr2.text()).length; i++) {
                if (sparray(tr2.text())[i] != sparray(tr.text())[i]) {
                    count++;
                }
            }

            arr[1] = sparray(tr2.text());

            for (let j = 0; j < arr[1].length; j++) {
                if (arr[1][j] == "-") {
                    arr[1][j] = "0";
                }
            }

            //move arr[1][5] to back and remove arr[1][5]
            arr[1].push(arr[1][5]);
            arr[1].splice(5, 1);
        }
        date2 = new Date(arr[1][0].substr(3, 2) + '/' + arr[1][0].substr(0, 2) + '/' + (parseInt(arr[1][0].substr(6, 4)) - 543));
        console.log(date1);
        console.log(date2);

    } catch (error) {
        console.log("old price error")
        console.log(error)
        const response = await fetch('https://xn--42cah7d0cxcvbbb9x.com/%E0%B8%A3%E0%B8%B2%E0%B8%84%E0%B8%B2%E0%B8%99%E0%B9%89%E0%B8%B3%E0%B8%A1%E0%B8%B1%E0%B8%99%E0%B8%A2%E0%B9%89%E0%B8%AD%E0%B8%99%E0%B8%AB%E0%B8%A5%E0%B8%B1%E0%B8%87/');
        body = await response.text();
        const $ = cheerio.load(body);
        // get div .table-fixed-right
        const table = $('.table-fixed-right');
        // get tbody inside table
        const tbody = table.find('tbody');
        // console.log(tbody.html());
        // get second and third tr inside tbody (inside td is not class btl)
        let tr = tbody.find('tr').eq(1);
        let tr2 = tbody.find('tr').eq(2);
        // if inside tr or tr2 is td.btl skip to next tr or tr2
        if (tr2.find('td').hasClass('btl')) {
            tr2 = tbody.find('tr').eq(3);
        }
        // const tr = tbody.find('tr').eq(1);
        // const tr2 = tbody.find('tr').eq(2);
        console.log(tr.html());
        console.log(tr2.html());
        //get number in td
        const td = tr.find('td');
        const td2 = tr2.find('td');
        //for each td
        //set td[5] to arr[0][1]
        //set td2[5] to arr[1][1]
        //set td[7] to arr[0][3]
        //set td2[7] to arr[1][3]
        //set td[6] to arr[0][4]
        //set td2[6] to arr[1][4]
        //set td[4] to arr[0][5]
        //set td2[4] to arr[1][5]
        //set td[3] to arr[0][6]
        //set td2[3] to arr[1][6]
        //set td[2] to arr[0][7]
        //set td2[2] to arr[1][7]
        //set td[1] to arr[0][8]
        //set td2[1] to arr[1][8]
        arr[0] = ["04/12/2566", td.eq(5).text(), td.eq(8).text(), td.eq(7).text(), td.eq(6).text(), td.eq(4).text(), td.eq(3).text(), td.eq(2).text(), td.eq(1).text()];
        arr[1] = ["22/12/2566", td2.eq(5).text(), td2.eq(8).text(), td2.eq(7).text(), td2.eq(6).text(), td2.eq(4).text(), td2.eq(3).text(), td2.eq(2).text(), td2.eq(1).text()];
        // td.each((i, el) => {
        //     console.log($(el).text());
        //     arr[0][i] = $(el).text();
        // });
        // td2.each((i, el) => {
        //     console.log($(el).text());
        //     arr[1][i] = $(el).text();
        // });
        // return historical;
        // get div .table-fixed-left
        const table2 = $('.table-fixed-left');
        // get tbody inside table
        const tbody2 = table2.find('tbody');
        // get second and third tr inside tbody (inside td is not class btl)
        let dtr = tbody2.find('tr').eq(1);
        let dtr2 = tbody2.find('tr').eq(2);
        //
        let monthtext = dtr.find('td').eq(0).text().split(' ')[1];
        let monthfirst = "";
        switch (monthtext) {
            case "ม.ค.":
                monthfirst = "01";
                break;
            case "ก.พ.":
                monthfirst = "02";
                break;
            case "มี.ค.":
                monthfirst = "03";
                break;
            case "เม.ย.":
                monthfirst = "04";
                break;
            case "พ.ค.":
                monthfirst = "05";
                break;
            case "มิ.ย.":
                monthfirst = "06";
                break;
            case "ก.ค.":
                monthfirst = "07";
                break;
            case "ส.ค.":
                monthfirst = "08";
                break;
            case "ก.ย.":
                monthfirst = "09";
                break;
            case "ต.ค.":
                monthfirst = "10";
                break;
            case "พ.ย.":
                monthfirst = "11";
                break;
            case "ธ.ค.":
                monthfirst = "12";
                break;
        }
        date1 = new Date(monthfirst + '/' + dtr.find('td').eq(0).text().split(' ')[0] + '/' + new Date().getFullYear());
        console.log(date1);
        arr[0][0] = (date1.getDate()).toString().padStart(2, '0') + '/' + (date1.getMonth() + 1).toString().padStart(2, '0') + '/' + (date1.getFullYear() + 543)
        // if inside tr or tr2 is td.btl skip to next tr or tr2
        if (dtr2.find('td').hasClass('btl')) {
            dtr2 = tbody2.find('tr').eq(3);
        }
        monthtext = dtr2.find('td').eq(0).text().split(' ')[1];
        monthfirst = "";
        switch (monthtext) {
            case "ม.ค.":
                monthfirst = "01";
                break;
            case "ก.พ.":
                monthfirst = "02";
                break;
            case "มี.ค.":
                monthfirst = "03";
                break;
            case "เม.ย.":
                monthfirst = "04";
                break;
            case "พ.ค.":
                monthfirst = "05";
                break;
            case "มิ.ย.":
                monthfirst = "06";
                break;
            case "ก.ค.":
                monthfirst = "07";
                break;
            case "ส.ค.":
                monthfirst = "08";
                break;
            case "ก.ย.":
                monthfirst = "09";
                break;
            case "ต.ค.":
                monthfirst = "10";
                break;
            case "พ.ย.":
                monthfirst = "11";
                break;
            case "ธ.ค.":
                monthfirst = "12";
                break;
        }
        date2 = new Date(monthfirst + '/' + dtr2.find('td').eq(0).text().split(' ')[0] + '/' + new Date().getFullYear());
        console.log(date2);
        arr[1][0] = (date2.getDate()).toString().padStart(2, '0') + '/' + (date2.getMonth() + 1).toString().padStart(2, '0') + '/' + (date2.getFullYear() + 543)
        console.log(arr);
    }

    // const pttprice = await fetch("https://orapiweb1.pttor.com/api/oilprice/search", {
    //     "headers": {
    //         "accept": "application/json, text/plain, */*",
    //         "accept-language": "th-TH,th;q=0.9,en;q=0.8",
    //         "content-type": "application/json",
    //         "sec-ch-ua": "\"Google Chrome\";v=\"107\", \"Chromium\";v=\"107\", \"Not=A?Brand\";v=\"24\"",
    //         "sec-ch-ua-mobile": "?0",
    //         "sec-ch-ua-platform": "\"macOS\"",
    //         "sec-fetch-dest": "empty",
    //         "sec-fetch-mode": "cors",
    //         "sec-fetch-site": "same-site",
    //         "Referer": "https://www.pttor.com/",
    //         "Referrer-Policy": "strict-origin-when-cross-origin"
    //     },
    //     "body": "{\"provinceId\":1,\"districtId\":null,\"year\":" + date1.getFullYear() + ",\"month\":" + (date1.getMonth() + 1) + ",\"pageSize\":1000000,\"pageIndex\":0}",
    //     "method": "POST"
    // });
    // let pttbody = await pttprice.json();

    const pttprice = await fetch("https://www.pttor.com/wp-admin/admin-ajax.php", {
        "headers": {
          "accept": "*/*",
          "accept-language": "th-TH,th;q=0.9,en;q=0.8",
          "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          "priority": "u=1, i",
          "sec-ch-ua": "\"Not(A:Brand\";v=\"99\", \"Google Chrome\";v=\"133\", \"Chromium\";v=\"133\"",
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": "\"macOS\"",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "x-requested-with": "XMLHttpRequest",
          "cookie": "_ga=GA1.1.831413899.1739374030; hidecta=no; OptanonConsent=isGpcEnabled=0&datestamp=Wed+Feb+12+2025+22%3A27%3A14+GMT%2B0700+(Indochina+Time)&version=202409.2.0&browserGpcFlag=0&isIABGlobal=false&hosts=&landingPath=NotLandingPage&groups=C0001%3A1%2CC0002%3A0%2CC0004%3A0&AwaitingReconsent=false; _ga_P1MB04T1HD=GS1.1.1739374029.1.1.1739374035.0.0.0; pll_language=en",
          "Referer": "https://www.pttor.com/news/oil-price",
          "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "body": "action=fetch_oil_prices&province=%E0%B8%81%E0%B8%A3%E0%B8%B8%E0%B8%87%E0%B9%80%E0%B8%97%E0%B8%9E%E0%B8%A1%E0%B8%AB%E0%B8%B2%E0%B8%99%E0%B8%84%E0%B8%A3&month="+(date1.getMonth() + 1)+"&year="+(date1.getFullYear() + 543),
        "method": "POST"
    });

    let pttbody = await pttprice.json();

    //console.log(pttbody);
    let pttarr
    let yesterday

    try {
        // pttarr = JSON.parse(pttbody.data[0].priceData);
        pttarr = pttbody.data[0].priceData;
    } catch (error) {
        pttarr = null;
    }

    if (pttbody.data.length >= 1 || pttarr == null) {
        // const backuppttprice = await fetch("https://orapiweb1.pttor.com/api/oilprice/search", {
        //     "headers": {
        //         "accept": "application/json, text/plain, */*",
        //         "accept-language": "th-TH,th;q=0.9,en;q=0.8",
        //         "content-type": "application/json",
        //         "sec-ch-ua": "\"Google Chrome\";v=\"107\", \"Chromium\";v=\"107\", \"Not=A?Brand\";v=\"24\"",
        //         "sec-ch-ua-mobile": "?0",
        //         "sec-ch-ua-platform": "\"macOS\"",
        //         "sec-fetch-dest": "empty",
        //         "sec-fetch-mode": "cors",
        //         "sec-fetch-site": "same-site",
        //         "Referer": "https://www.pttor.com/",
        //         "Referrer-Policy": "strict-origin-when-cross-origin"
        //     },
        //     "body": "{\"provinceId\":1,\"districtId\":null,\"year\":" + date1.getFullYear() + ",\"month\":" + date1.getMonth() + ",\"pageSize\":1000000,\"pageIndex\":0}",
        //     "method": "POST"
        // });
        const backuppttprice = await fetch("https://www.pttor.com/wp-admin/admin-ajax.php", {
            "headers": {
              "accept": "*/*",
              "accept-language": "th-TH,th;q=0.9,en;q=0.8",
              "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
              "priority": "u=1, i",
              "sec-ch-ua": "\"Not(A:Brand\";v=\"99\", \"Google Chrome\";v=\"133\", \"Chromium\";v=\"133\"",
              "sec-ch-ua-mobile": "?0",
              "sec-ch-ua-platform": "\"macOS\"",
              "sec-fetch-dest": "empty",
              "sec-fetch-mode": "cors",
              "sec-fetch-site": "same-origin",
              "x-requested-with": "XMLHttpRequest",
              "cookie": "_ga=GA1.1.831413899.1739374030; hidecta=no; OptanonConsent=isGpcEnabled=0&datestamp=Wed+Feb+12+2025+22%3A27%3A14+GMT%2B0700+(Indochina+Time)&version=202409.2.0&browserGpcFlag=0&isIABGlobal=false&hosts=&landingPath=NotLandingPage&groups=C0001%3A1%2CC0002%3A0%2CC0004%3A0&AwaitingReconsent=false; _ga_P1MB04T1HD=GS1.1.1739374029.1.1.1739374035.0.0.0; pll_language=en",
              "Referer": "https://www.pttor.com/news/oil-price",
              "Referrer-Policy": "strict-origin-when-cross-origin"
            },
            "body": "action=fetch_oil_prices&province=%E0%B8%81%E0%B8%A3%E0%B8%B8%E0%B8%87%E0%B9%80%E0%B8%97%E0%B8%9E%E0%B8%A1%E0%B8%AB%E0%B8%B2%E0%B8%99%E0%B8%84%E0%B8%A3&month="+date1.getMonth()+"&year="+(date1.getFullYear() + 543),
            "method": "POST"
        });
        const backuppttbody = await backuppttprice.json();
        // yesterday = JSON.parse(backuppttbody.data[0].priceData);
        if (backuppttbody.data.length >= 1) {
            yesterday = backuppttbody.data[0].priceData;
            if (pttarr == null) {
                // pttarr = JSON.parse(backuppttbody.data[0].priceData);
                pttarr = backuppttbody.data[0].priceData;
                pttbody = backuppttbody;
            }
        } else {
            let found = false;
            let month = date1.getMonth() - 1;
            let year = date1.getFullYear() + 543;
            while (!found) {
                const loopbackuppttprice = await fetch("https://www.pttor.com/wp-admin/admin-ajax.php", {
                    "headers": {
                    "accept": "*/*",
                    "accept-language": "th-TH,th;q=0.9,en;q=0.8",
                    "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                    "priority": "u=1, i",
                    "sec-ch-ua": "\"Not(A:Brand\";v=\"99\", \"Google Chrome\";v=\"133\", \"Chromium\";v=\"133\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": "\"macOS\"",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin",
                    "x-requested-with": "XMLHttpRequest",
                    "cookie": "_ga=GA1.1.831413899.1739374030; hidecta=no; OptanonConsent=isGpcEnabled=0&datestamp=Wed+Feb+12+2025+22%3A27%3A14+GMT%2B0700+(Indochina+Time)&version=202409.2.0&browserGpcFlag=0&isIABGlobal=false&hosts=&landingPath=NotLandingPage&groups=C0001%3A1%2CC0002%3A0%2CC0004%3A0&AwaitingReconsent=false; _ga_P1MB04T1HD=GS1.1.1739374029.1.1.1739374035.0.0.0; pll_language=en",
                    "Referer": "https://www.pttor.com/news/oil-price",
                    "Referrer-Policy": "strict-origin-when-cross-origin"
                    },
                    "body": "action=fetch_oil_prices&province=%E0%B8%81%E0%B8%A3%E0%B8%B8%E0%B8%87%E0%B9%80%E0%B8%97%E0%B8%9E%E0%B8%A1%E0%B8%AB%E0%B8%B2%E0%B8%99%E0%B8%84%E0%B8%A3&month="+month+"&year="+year,
                    "method": "POST"
                });
                const loopbackuppttbody = await loopbackuppttprice.json();
                if (loopbackuppttbody.data.length >= 1) {
                    yesterday = loopbackuppttbody.data[0].priceData;
                    if (pttarr == null) {
                        // pttarr = JSON.parse(backuppttbody.data[0].priceData);
                        pttarr = loopbackuppttbody.data[0].priceData;
                        pttbody = loopbackuppttbody;
                    }
                    found = true;
                } else {
                    month--;
                    if (month < 1) {
                        month = 12;
                        year--;
                    }
                }
            }
        }
    } else {
        yesterday = JSON.parse(pttbody.data[1].priceData);
    }

    //const yesterday = JSON.parse(pttbody.data[1].priceData);
    const pttdate = new Date(pttbody.data[0].priceDate);
    console.log('pttdate', pttdate);

    console.log('date1', date1);

    //if date1 is not same date as pttdate, get yesterday
    //if (date1.getDate() != pttdate.getDate()) {
    if (date1 > pttdate) {
        pttarr.forEach(e => {
            if (e.OilTypeId == 'เบนซิน') {
                arr[0][10] = arr[0][9]
                arr[0][9] = '' + e.Price
                arr[1][10] = arr[1][9]
                arr[1][9] = '' + e.Price
            }
            /*if (e.OilTypeId == 1) {
                arr[0][11] = '' + e.Price
            }*/
            if (e.OilTypeId == 'Super Power GSH95') {
                //arr[0][12] = '' + e.Price
                arr[0][11] = '' + e.Price
                arr[1][11] = '' + e.Price
            }
        });
    } else {
        pttarr.forEach(e => {
            if (e.OilTypeId == 'เบนซิน') {
                arr[0][10] = arr[0][9]
                arr[0][9] = '' + e.Price
            }
            /*if (e.OilTypeId == 1) {
                arr[0][11] = '' + e.Price
            }*/
            if (e.OilTypeId == 'Super Power GSH95') {
                //arr[0][12] = '' + e.Price
                arr[0][11] = '' + e.Price
            }
        });

        yesterday.forEach(e => {
            if (e.OilTypeId == 'เบนซิน') {
                arr[1][10] = arr[1][9]
                arr[1][9] = '' + e.Price
            }
            /*if (e.OilTypeId == 1) {
                arr[1][11] = '' + e.Price
            }*/
            if (e.OilTypeId == 'Super Power GSH95') {
                //arr[1][12] = '' + e.Price
                arr[1][11] = '' + e.Price
            }
        });
    }
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
    //now[0] = now[0].replace(now[0].substr(0, 2), String(parseInt(now[0].substr(0, 2)) + 1).padStart(2, '0'));
    //old[0] = old[0].replace(old[0].substr(0, 2), String(parseInt(old[0].substr(0, 2)) + 1).padStart(2, '0'));

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
    let newdata3 = ["", "", "", "", "", "", "", "", "", "", "", "", ""];

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
    if (month == null) {
        //get full month
        let monthfulltext = new Date().toLocaleString('en-us', { month: 'long' });
        //change null to array
        month = [];
        month.push(monthfulltext);
    }
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
    // let todaydate = new Date(monthnum + '/' + before + '/' + year.toString());
    let todaydate = new Date(year.toString(), monthnum, before);

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
    // newdata[7] = body.data.items[7].PriceTomorrow.toString();
    // newdata[8] = body.data.items[8].PriceTomorrow.toString();
    newdata[7] = 0;
    newdata[8] = 0;
    //newdata[9] = body.data.items[4].PriceTomorrow.toString();
    newdata[10] = body.data.items[4].PriceTomorrow.toString();

    let noten = false;

    const controller = new AbortController();
    const timeout = setTimeout(() => {
        controller.abort();
    }, 1000);

    try {
        let anothertmrprice = await fetch('https://crmmobile.bangchak.co.th/webservice/oil_price.aspx', { signal: controller.signal });
        let anotherbody = await anothertmrprice.text();
        //get price from xml
        const $another = cheerio.load(anotherbody);

        let anotherarr = $another('update_date').text().split('/');

        if (anotherarr != '' && anotherarr != null && anotherarr != undefined) {

            let anotherdate = new Date(anotherarr[2] - 543, anotherarr[1] - 1, anotherarr[0]);

            newdata3[1] = $another('item').eq(0).find('tomorrow').text();
            newdata3[2] = $another('item').eq(1).find('tomorrow').text();
            newdata3[3] = $another('item').eq(2).find('tomorrow').text();
            newdata3[4] = $another('item').eq(3).find('tomorrow').text();
            newdata3[5] = $another('item').eq(5).find('tomorrow').text();
            // newdata3[5] = $another('item').eq(4).find('tomorrow').text();
            // newdata3[6] = $another('item').eq(5).find('tomorrow').text();
            newdata3[6] = $another('item').eq(6).find('tomorrow').text();
            // newdata3[7] = $another('item').eq(6).find('tomorrow').text();
            newdata3[7] = $another('item').eq(7).find('tomorrow').text();
            // newdata3[8] = $another('item').eq(7).find('tomorrow').text();
            newdata3[8] = $another('item').eq(8).find('tomorrow').text();
            // newdata3[9] = $another('item').eq(8).find('tomorrow').text();
            newdata3[9] = $another('item').eq(4).find('tomorrow').text();
            // newdata3[10] = parseFloat($another('item').eq(7).find('tomorrow').text()) + 9.89+(parseFloat($another('item').eq(7).find('today').text())-parseFloat($another('item').eq(7).find('tomorrow').text()));
            // if(parseFloat($another('item').eq(7).find('tomorrow').text())-parseFloat($another('item').eq(7).find('today').text()) > 0){
            if (parseFloat($another('item').eq(7).find('tomorrow').text()) > parseFloat($another('item').eq(7).find('today').text())) {
                //newdata3[10] = parseFloat(data[0][10]) - (parseFloat($another('item').eq(7).find('today').text())-parseFloat($another('item').eq(7).find('tomorrow').text()));
                newdata3[10] = parseFloat(data[0][10]) + (parseFloat($another('item').eq(7).find('tomorrow').text()) - parseFloat($another('item').eq(7).find('today').text()));
            } else {
                //newdata3[10] = parseFloat(data[0][10]) + (parseFloat($another('item').eq(7).find('today').text())-parseFloat($another('item').eq(7).find('tomorrow').text()));
                newdata3[10] = parseFloat(data[0][10]) - (parseFloat($another('item').eq(7).find('today').text()) - parseFloat($another('item').eq(7).find('tomorrow').text()));
            }
            newdata3[10] = parseFloat(newdata3[10]).toFixed(2).toString();
            noten = true;
            let realDate = new Date(anotherarr[2] - 543, anotherarr[1] - 1, parseInt(anotherarr[0]) + 1);
            //check all day in that month
            if (realDate.getDay() > new Date(anotherarr[2] - 543, anotherarr[1] - 1, 0).getDay()) {
                realDate = new Date(anotherarr[2] - 543, anotherarr[1] + 1, 1);
                newdata3[0] = (realDate.getDate()).toString().padStart(2, '0') + '/' + (realDate.getMonth() + 1).toString().padStart(2, '0') + '/' + (realDate.getFullYear() + 543);
            } else {
                newdata3[0] = (parseInt(anotherarr[0]) + 1).toString().padStart(2, '0') + '/' + anotherarr[1].padStart(2, '0') + '/' + anotherarr[2];
                newdata3[0] = newdata3[0].split(' ')[0];
            }


            console.log('newdata >>> ' + newdata);
            console.log('newdata3 >>>' + newdata3);

            //if todaydate < real today
            if (todaydate < date) {
                console.log('wrong date');
                //set newdata to data[0]
                newdata = data[0];
            }
            //}

            arrdiff = newdata.filter(x => !newdata3.includes(x));
            console.log('arrdiff >>> ' + arrdiff.length);
            if (arrdiff.length == 2) {
                console.log('same data');
                newdata = data[0];
            } else if (arrdiff.length > 2) {
                console.log('diff data');
                newdata = newdata3;
            }
        }
    } catch (error) {
        console.log(error);
        if (error) {
            console.log('request was aborted');
            // new code
            let anothertmrprice = await fetch('https://oil-price.bangchak.co.th/apioilprice2/th')
            let anotherbody = await anothertmrprice.json();

            let arraytexttoarray = JSON.parse(anotherbody[0].OilList);

            console.log(arraytexttoarray);
            console.log("-----");

            let anotherarr = anotherbody[0].OilMessageDate.split('/');

            if (anotherarr != '' && anotherarr != null && anotherarr != undefined) {
                let anotherdate = new Date(anotherarr[2] - 543, anotherarr[1] - 1, anotherarr[0]);

                newdata3[1] = arraytexttoarray[0].PriceTomorrow.toString();
                newdata3[2] = arraytexttoarray[1].PriceTomorrow.toString();
                newdata3[3] = arraytexttoarray[2].PriceTomorrow.toString();
                newdata3[4] = arraytexttoarray[3].PriceTomorrow.toString();
                // newdata3[5] = $another('item').eq(5).find('tomorrow').text();
                newdata3[5] = arraytexttoarray[4].PriceTomorrow.toString();
                newdata3[6] = arraytexttoarray[5].PriceTomorrow.toString();
                newdata3[7] = arraytexttoarray[6].PriceTomorrow.toString();
                // newdata3[8] = arraytexttoarray[7].PriceTomorrow.toString();
                // newdata3[9] = arraytexttoarray[8].PriceTomorrow.toString();
                // newdata3[10] = arraytexttoarray[9]?.PriceTomorrow.toString();
                newdata3[8] = 0;
                newdata3[9] = 0;
                newdata3[10] = 0;
                // newdata3[10] = parseFloat($another('item').eq(7).find('tomorrow').text()) + 9.89+(parseFloat($another('item').eq(7).find('today').text())-parseFloat($another('item').eq(7).find('tomorrow').text()));
                // if(parseFloat($another('item').eq(7).find('tomorrow').text())-parseFloat($another('item').eq(7).find('today').text()) > 0){
                if (newdata3[10] == undefined) {
                    if (parseFloat(arraytexttoarray[7].PriceTomorrow.toString()) > parseFloat(arraytexttoarray[7].PriceToday.toString())) {
                        //newdata3[10] = parseFloat(data[0][10]) - (parseFloat($another('item').eq(7).find('today').text())-parseFloat($another('item').eq(7).find('tomorrow').text()));
                        newdata3[10] = parseFloat(data[0][10]) + (parseFloat(arraytexttoarray[7].PriceTomorrow.toString()) - parseFloat(arraytexttoarray[7].PriceToday.toString()));
                    } else {
                        //newdata3[10] = parseFloat(data[0][10]) + (parseFloat($another('item').eq(7).find('today').text())-parseFloat($another('item').eq(7).find('tomorrow').text()));
                        newdata3[10] = parseFloat(data[0][10]) - (parseFloat(arraytexttoarray[7].PriceToday.toString()) - parseFloat(arraytexttoarray[7].PriceTomorrow.toString()));
                    }
                    newdata3[10] = parseFloat(newdata3[10]).toFixed(2).toString();
                }
                // newdata3[0] = (parseInt(anotherarr[0])+1).toString().padStart(2, '0') + '/' + anotherarr[1].padStart(2, '0') + '/' + anotherarr[2];
                // newdata3[0] = newdata3[0].split(' ')[0];
                let realDate = new Date(anotherarr[2] - 543, anotherarr[1] - 1, parseInt(anotherarr[0]) + 1);
                //check all day in that month
                if (realDate.getDay() > new Date(anotherarr[2] - 543, anotherarr[1] - 1, 0).getDay()) {
                    realDate = new Date(anotherarr[2] - 543, anotherarr[1] + 1, 1);
                }

                console.log('newdata >>> ' + newdata);
                console.log('newdata3 >>>' + newdata3);

                //if todaydate < real today
                if (todaydate < date) {
                    console.log('wrong date');
                    //set newdata to data[0]
                    newdata = data[0];
                }
                //}

                arrdiff = newdata.filter(x => !newdata3.includes(x));
                console.log('arrdiff >>> ' + arrdiff.length);
                if (arrdiff.length == 2) {
                    console.log('same data');
                    newdata = data[0];
                } else if (arrdiff.length > 2) {
                    console.log('diff data');
                    newdata = newdata3;
                }
            }
        }
    } finally {
        clearTimeout(timeout);
    }

    // old code
    // let anothertmrprice = await fetch('https://crmmobile.bangchak.co.th/webservice/oil_price.aspx', {signal: controller.signal});
    // let anotherbody = await anothertmrprice.text();
    // //get price from xml
    // const $another = cheerio.load(anotherbody);

    // let anotherarr = $another('update_date').text().split('/');

    // if(anotherarr != '' && anotherarr != null && anotherarr != undefined){

    //     let anotherdate = new Date(anotherarr[2] - 543, anotherarr[1] - 1, anotherarr[0]);

    //     newdata3[1] = $another('item').eq(0).find('tomorrow').text();
    //     newdata3[2] = $another('item').eq(1).find('tomorrow').text();
    //     newdata3[3] = $another('item').eq(2).find('tomorrow').text();
    //     newdata3[4] = $another('item').eq(3).find('tomorrow').text();
    //     // newdata3[5] = $another('item').eq(5).find('tomorrow').text();
    //     newdata3[5] = $another('item').eq(4).find('tomorrow').text();
    //     newdata3[6] = $another('item').eq(5).find('tomorrow').text();
    //     newdata3[7] = $another('item').eq(6).find('tomorrow').text();
    //     newdata3[8] = $another('item').eq(7).find('tomorrow').text();
    //     newdata3[9] = $another('item').eq(8).find('tomorrow').text();
    //     // newdata3[10] = parseFloat($another('item').eq(7).find('tomorrow').text()) + 9.89+(parseFloat($another('item').eq(7).find('today').text())-parseFloat($another('item').eq(7).find('tomorrow').text()));
    //     // if(parseFloat($another('item').eq(7).find('tomorrow').text())-parseFloat($another('item').eq(7).find('today').text()) > 0){
    //     if(parseFloat($another('item').eq(7).find('tomorrow').text()) > parseFloat($another('item').eq(7).find('today').text())){
    //         //newdata3[10] = parseFloat(data[0][10]) - (parseFloat($another('item').eq(7).find('today').text())-parseFloat($another('item').eq(7).find('tomorrow').text()));
    //         newdata3[10] = parseFloat(data[0][10]) + (parseFloat($another('item').eq(7).find('tomorrow').text())-parseFloat($another('item').eq(7).find('today').text()));
    //     }else{
    //         //newdata3[10] = parseFloat(data[0][10]) + (parseFloat($another('item').eq(7).find('today').text())-parseFloat($another('item').eq(7).find('tomorrow').text()));
    //         newdata3[10] = parseFloat(data[0][10]) - (parseFloat($another('item').eq(7).find('today').text())-parseFloat($another('item').eq(7).find('tomorrow').text()));
    //     }
    //     newdata3[10] = parseFloat(newdata3[10]).toFixed(2).toString();
    //     newdata3[0] = (parseInt(anotherarr[0])+1).toString().padStart(2, '0') + '/' + anotherarr[1].padStart(2, '0') + '/' + anotherarr[2];
    //     newdata3[0] = newdata3[0].split(' ')[0];

    //     console.log('newdata >>> ' + newdata);
    //     console.log('newdata3 >>>' + newdata3);

    //     //if todaydate < real today
    //     if (todaydate < date) {
    //         console.log('wrong date');
    //         //set newdata to data[0]
    //         newdata = data[0];
    //     }
    //     //}

    //     arrdiff = newdata.filter(x => !newdata3.includes(x));
    //     console.log('arrdiff >>> ' + arrdiff.length);
    //     if(arrdiff.length == 2){
    //         console.log('same data');
    //         newdata = data[0];
    //     } else if (arrdiff.length > 2) {
    //         console.log('diff data');
    //         newdata = newdata3;
    //     }

    // } else {
    //     newdata3 = data[0];
    //     newdata = data[0];
    // }

    //convert text newdata2[0] and newdata[0] to date
    let newdate1 = newdata2[0].split('/');
    let newdate1date = new Date(newdate1[2] - 543, newdate1[1] - 1, newdate1[0]);
    let newdate2 = newdata[0].split('/');
    let newdate2date = new Date(newdate2[2] - 543, newdate2[1] - 1, newdate2[0]);
    let newdate3 = newdata3[0].split('/');
    let newdate3date = new Date(newdate3[2] - 543, newdate3[1] - 1, newdate3[0]);
    //if newdate1date > newdate2date
    let comefromnew = false;
    noten = true;
    console.log(newdate2date);
    console.log(newdate3date);
    if (newdate3date > newdate2date) {
        if (newdate3date > newdate1date || newdata2[0] == '') {
            //set newdata3 to newdata
            console.log(newdate1date);
            console.log(newdate3date);
            // newdata = newdata3;
            newdata = newdata2;
            console.log('newdata3');
            comefromnew = true;
            noten = true;
        }
    } else {
        if (newdate2date != newdate1date) {
            if (newdate1date > newdate2date) {
                //set newdata2 to newdata
                console.log(newdate1date);
                console.log(newdate2date);
                // newdata = newdata2;
                newdata = newdata3;
                console.log('newdata2');
                comefromnew = true;
                noten = false;
            }
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
        if (!comefromnew) {
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

            if (parseFloat(data[2][6]) != 0.00) {
                data[0][9] = '~' + data[0][9];
                data[0][11] = '~' + data[0][11];
                if (parseFloat(data[2][10]) > 0.5 || (noten == true && parseFloat(data[2][10]) > 0)) {
                    data[0][10] = '~' + data[0][10];
                }
            }
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

    //check last time

    // if data[0] and data[1] is different only 1 element set data[0] to data[1] and set data[1] = await getData()[1];

    console.log("data[0].filter(x => !data[1].includes(x)).length : " + data[0].filter(x => !data[1].includes(x)).length)
    if (data[0].filter(x => !data[1].includes(x)).length === 1) {
        data[0] = data[1];
        let newwow = await getData();
        data[1] = newwow[1];
        data[2] = newwow[2];
    }

    if (data[1][10] == null) {
        data[0][0] = data[1][0];
        let newwow = await getData();
        data[1] = newwow[1];
        if(data[1][10] == null || data[1][10] == undefined){
            if (parseFloat(data[1][7]) > parseFloat(data[0][7].toString())) {
                data[1][10] = parseFloat(data[0][10]) + (parseFloat(data[1][7].toString()) - parseFloat(data[0][7].toString()));
            } else {
                data[1][10] = parseFloat(data[0][10]) - (parseFloat(data[0][7].toString()) - parseFloat(data[1][7].toString()));
            }
            data[1][10] = parseFloat(data[1][10]).toFixed(2).toString();
            if (parseFloat(data[1][2]) > parseFloat(data[0][2].toString())) {
                data[1][1] = parseFloat(data[0][1]) + (parseFloat(data[1][2].toString()) - parseFloat(data[0][2].toString()));
            } else {
                data[1][1] = parseFloat(data[0][1]) - (parseFloat(data[0][2].toString()) - parseFloat(data[1][2].toString()));
            }
            data[1][1] = parseFloat(data[1][1]).toFixed(2).toString();
        }
        //temp data[0] and data[1] without first index
        const tempdata0 = data[0].slice(1);
        const tempdata1 = data[1].slice(1);
        console.log("test");
        console.log(data[0]);
        console.log(data[1]);

        const arr2 = tempdata0.map((e, i) => e - tempdata1[i]);
        data[1][10] = "~" + data[1][10];
        data[1][1] = "~" + data[1][1];
        //console.log(arr2);

        var difftime = Math.abs(new Date(data[1][0].substr(3, 2) + '/' + data[1][0].substr(0, 2) + '/' + (parseInt(data[1][0].substr(6, 4)) - 543)).getTime() - new Date(data[0][0].substr(3, 2) + '/' + data[0][0].substr(0, 2) + '/' + (parseInt(data[0][0].substr(6, 4)) - 543)).getTime());
        var diffdays = Math.ceil(difftime / (1000 * 3600 * 24));

        // arr2[0] = diffdays;

        //remove NaN
        const arr3 = arr2.filter(e => !isNaN(e));
        //console.log(arr3);

        //format number to 2 decimal
        const arr4 = arr3.map(e => e.toFixed(2));

        //add วัน to first arr4
        arr4.unshift(parseInt(diffdays) + ' วัน');
        data[2] = arr4;
    }

    console.log("===== before =====")
    console.log(data[0])
    console.log(data[1])
    console.log(data[2])

    //rearrange
    let temp = data[0][5];
    let temptwo = data[1][5];
    let tempthree = data[2][5];
    data[0][5] = data[0][4];
    data[1][5] = data[1][4];
    data[2][5] = data[2][4];
    // data[0][7] = temp;
    // data[1][7] = temptwo;
    // data[2][7] = tempthree;
    // temp = data[0][8];
    // temptwo = data[1][8];
    // tempthree = data[2][8];
    data[0][8] = data[0][6];
    data[1][8] = data[1][6];
    data[2][8] = data[2][6];
    data[0][4] = data[0][10];
    data[1][4] = data[1][7];
    data[2][4] = (parseFloat(data[0][4]) - parseFloat(data[1][4])).toFixed(2).toString();
    data[0][10] = data[0][3];
    data[1][10] = data[1][3];
    data[2][10] = data[2][3];
    data[0][7] = temp;
    data[1][7] = temptwo;
    data[2][7] = tempthree;
    data[0][6] = data[0][4];
    data[1][6] = data[1][4];
    data[2][6] = data[2][4];

    //recalculate data[2] index 9 and beyond
    for (let i = 9; i < data[0].length; i++) {
        data[2][i] = (parseFloat(data[0][i]) - parseFloat(data[1][i])).toFixed(2).toString();
    }

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

    // const check = await fetch('https://anywhere.pwisetthon.com/https://thaioilpriceapi-vercel.vercel.app?info=true');
    const check = await fetch('https://topapi.pwisetthon.com?info=true');
    const checkbody = await check.json();
    //write info.lastupdate to file
    try {
        fs.writeFileSync('test.txt', checkbody.info.lastupdate);
        location = ''
    } catch (error) {
        fs.writeFileSync('/tmp/test.txt', checkbody.info.lastupdate);
        location = '/tmp/'
    }
    if (fs.existsSync(location + 'lastupdate.txt') === false) {
        try {
            fs.writeFileSync('lastupdate.txt', checkbody.info.lastupdate);
            location = ''
        } catch (error) {
            fs.writeFileSync('/tmp/lastupdate.txt', checkbody.info.lastupdate);
            location = '/tmp/'
        }
    } else {
        if (checkbody.info.lastupdate !== fs.readFileSync(location + 'lastupdate.txt', 'utf8')) {
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

    // if (imageexist && checkbody.info.lastupdate === fs.readFileSync(location + 'lastupdate.txt', 'utf8')) {
    //read image file and send
    res.header('content-type', 'image/png');
    //try {
    //fs.createReadStream(location+'oilprice.png').pipe(res);
    //} catch (error) {
    //fs.createReadStream('/tmp/oilprice.png').pipe(res);
    //}
    //read file and return
    // return fs.readFileSync(location + 'oilprice.png')
    if (imageexist && checkbody.info.lastupdate === fs.readFileSync(location + 'lastupdate.txt', 'utf8')) {
        // res.send(fs.readFileSync(location + 'oilprice.png'))
        return fs.readFileSync(location + 'oilprice.png')
    }
    // } else {
    let finish = false;
    let screenshotbody;
    while (finish === false) {
        const screenshot = await fetch('https://api.apiflash.com/v1/urltoimage?access_key='+process.env.aaf+'&url=https%3A%2F%2Fpwisetthon.com%2Fthaioilpriceapi&format=jpeg&width=1000&height=1000&delay=10&fresh=true')
        screenshotbody = await screenshot.buffer();
        //write image file
        if (screenshotbody.length > 2000) {
            try {
                fs.writeFileSync('oilprice.png', screenshotbody);
            } catch (error) {
                fs.writeFileSync('/tmp/oilprice.png', screenshotbody);
            }
            finish = true;
        }
    }
    //send image
    // res.header('content-type', 'image/png');
    return screenshotbody;
    // }

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
