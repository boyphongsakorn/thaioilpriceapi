const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const cheerio = require('cheerio');
var http = require('http');
var fs = require('fs');
//const Pageres = require('pageres');
//const Pageres = (...args) => import('pageres');
//const querystring = require('querystring');

//if process.port is not empty , then set port to 8080
const port = process.env.PORT || 8080;

async function getData() {
    const response = await fetch('https://www.bangchak.co.th/th/oilprice/historical');
    const body = await response.text();

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
        "body": "{\"provinceId\":1,\"districtId\":null,\"year\":"+date1.getFullYear()+",\"month\":"+(date1.getMonth()+1)+",\"pageSize\":1000000,\"pageIndex\":0}",
        "method": "POST"
    });
    const pttbody = await pttprice.json();

    //console.log(pttbody);

    const pttarr = JSON.parse(pttbody.data[0].priceData);
    let yesterday
    
    if(pttbody.data.length == 1){
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
            "body": "{\"provinceId\":1,\"districtId\":null,\"year\":"+date1.getFullYear()+",\"month\":"+date1.getMonth()+",\"pageSize\":1000000,\"pageIndex\":0}",
            "method": "POST"
        });
        const backuppttbody = await backuppttprice.json();
        yesterday = JSON.parse(backuppttbody.data[0].priceData);
    }else{
        yesterday = JSON.parse(pttbody.data[1].priceData);
    }

    //const yesterday = JSON.parse(pttbody.data[1].priceData);

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

    let now = sparray(tr.text());
    let old = sparray(tr2.text());

    pttarr.forEach(e => {
        if (e.OilTypeId == 7) {
            now[10] = now[9]
            now[9] = '' + e.Price
        }
    });

    yesterday.forEach(e => {
        if (e.OilTypeId == 7) {
            old[10] = old[9]
            old[9] = '' + e.Price
        }
    });

    //console.log(pttarr);

    console.log(now);
    console.log(old);

    //const pttprice = await fetch('https://www.pttor.com/th/oil_price');
    //const pttbody = await pttprice.text();

    //console.log(arr4);
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

http.createServer(async function (req, res) {
    if (req.url == '/image') {
        /*await new Pageres({ format: 'png', delay: 3, filename: 'oilprice', launchOptions: { args: ['--no-sandbox', '--disable-setuid-sandbox', '--no-first-run', '--disable-extensions'] } })
            .src('https://boyphongsakorn.github.io/thaioilpriceapi/', ['1000x1000'], { crop: true })
            .dest(__dirname)
            .run();

        console.log('Finished generating screenshots!');

        res.writeHead(200, { 'content-type': 'image/png' });
        fs.createReadStream('oilprice.png').pipe(res);*/

        const screenshot = await fetch('https://screenshot-xi.vercel.app/api?url=https://boyphongsakorn.github.io/thaioilpriceapi&width=1000&height=1000')
        const screenshotbody = await screenshot.buffer();

        res.writeHead(200, { 'content-type': 'image/png' });
        res.end(screenshotbody);

    } else {
        //get parameter from url
        const url = new URL(req.url, 'http://localhost:8080');
        const info = url.searchParams.get('info');
        console.log(info);
        let data = await getData();
        console.log('data', data);
        let newdata = ["", "", "", "", "", "", "", "", "", ""];

        let tmrprice = await fetch('https://crmmobile.bangchak.co.th/webservice/oil_price.aspx')
        let body = await tmrprice.text();
        //if tmrprce is 4xx or 5xx
        if (tmrprice.status >= 400 && tmrprice.status <= 599) {
            //if have tmrprice.txt
            if (fs.existsSync('/tmp/tmrprice.txt')) {
                //body = fs.readFileSync('tmrprice.txt', 'utf8');
                body = fs.readFileSync('/tmp/tmrprice.txt', 'utf8');
            }else{
                newdata[0] = "ไม่สามารถติดต่อกับระบบได้";
            }
        }else{
            //write body to tmrprice.txt
            fs.writeFileSync('/tmp/tmrprice.txt', body);
        }

        /*await fetch('https://crmmobile.bangchak.co.th/webservice/oil_price.aspx')
            .then(res => res.text())
            .then(body => {*/
        const $ = cheerio.load(body);

        let arr = $('update_date').text().split('/');

        let year = parseInt(arr[2].substring(0, 4)) - 543;

        let todaydate = new Date(arr[1] + '/' + arr[0] + '/' + year.toString());

        console.log(arr);
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

        newdata[1] = $('item').eq(0).find('tomorrow').text();
        newdata[2] = $('item').eq(1).find('tomorrow').text();
        newdata[3] = $('item').eq(2).find('tomorrow').text();
        newdata[4] = $('item').eq(3).find('tomorrow').text();
        newdata[5] = $('item').eq(4).find('tomorrow').text();
        newdata[6] = $('item').eq(5).find('tomorrow').text();
        newdata[7] = $('item').eq(6).find('tomorrow').text();
        newdata[8] = $('item').eq(7).find('tomorrow').text();
        newdata[9] = '-';

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
            let comefromnew = false;

            const fromnew = await fetch('https://www.prachachat.net/feed?tag=%E0%B8%A3%E0%B8%B2%E0%B8%84%E0%B8%B2%E0%B8%99%E0%B9%89%E0%B8%B3%E0%B8%A1%E0%B8%B1%E0%B8%99');
            const fromnewbody = await fromnew.text();
            const $fromnew = cheerio.load(fromnewbody);
            //arary item
            const fromnewitem = $fromnew('item');
            //console each title
            fromnewitem.each((i, el) => {
                if($fromnew(el).find('title').text().includes('พรุ่งนี้')){
                    //console.log($fromnew(el).find('title').text());
                    //console.log($fromnew(el).find('pubDate').text());
                    //convert from Mon, 21 Nov 2022 10:12:20 +0000 to date
                    //console.log(new Date($fromnew(el).find('pubDate').text()));
                    //if new Date($fromnew(el).find('pubDate').text()) same as today
                    if(new Date($fromnew(el).find('pubDate').text()).getDate() == new Date().getDate() && new Date($fromnew(el).find('pubDate').text()).getMonth() == new Date().getMonth() && new Date($fromnew(el).find('pubDate').text()).getFullYear() == new Date().getFullYear()){
                    //if(new Date($fromnew(el).find('pubDate').text()) == new Date()){
                        console.log('new');
                        const content = $fromnew(el).find('content\\:encoded').html();
                        //find ul tag in content
                        const $content = cheerio.load(content);
                        const ul = $content('ul');
                        //count ul
                        if(ul.length > 1){
                            //console each li tag
                            ul[0].children.forEach((li) => {
                                if(li.name === 'li'){
                                    //console.log(li.children[0].data);
                                    if(li.children[0].data.includes('ULG')){
                                        console.log('ul')
                                        //console.log(li.children[0].data);
                                        let ulg = li.children[0].data.replace('ULG', '').replace('=','').replace('บาท','').trim();
                                        data[0][10] = data[0][9];
                                        data[0][9] = ulg;
                                        comefromnew = true;
                                    }
                                }
                            });
                        }
                        //find p tag in content
                        const p = $content('p').toArray();
                        //count p
                        if(p.length > 1){
                            //loop console each p tag
                            p.forEach((p) => {
                                if($content(p).text().includes('ULG')){
                                    console.log('p')
                                    //console.log($content(p).text());
                                    let ptext = $content(p).text().replace('ULG', '').replace('=','').replace('บาท','').replace(',','').trim();
                                    data[0][10] = data[0][9];
                                    data[0][9] = ptext;
                                    comefromnew = true;
                                }
                            });
                        }
                    }
                }
            })

            if(comefromnew === false){
                data[0][10] = data[0][9];
                data[0][9] = parseFloat(data[1][9]) + parseFloat(data[2][8]);
            }

            //subtract data[1] from data[0] and set to data[2]
            data[2] = data[0].map((e, i) => e - data[1][i]);
            //format number to 2 decimal
            data[2] = data[2].map(e => e.toFixed(2));

            if(comefromnew === false){
                data[0][9] = '~' + data[0][9];
            }

            var date1 = new Date(data[0][0].substr(3, 2) + '/' + data[0][0].substr(0, 2) + '/' + (parseInt(data[0][0].substr(6, 4)) - 543));
            var date2 = new Date(data[1][0].substr(3, 2) + '/' + data[1][0].substr(0, 2) + '/' + (parseInt(data[1][0].substr(6, 4)) - 543));
            console.log(date1);
            console.log(date2);

            var difftime = Math.abs(date2.getTime() - date1.getTime());
            var diffdays = Math.ceil(difftime / (1000 * 3600 * 24));

            data[2][0] = diffdays + ' วัน';

            //remove last element of data[2]
            data[2].pop();
        }

        let newway;

        if(info === 'true'){
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
                }
            }
        }

        //writehead json
        res.writeHead(200, { 'Content-Type': 'application/json' });
        if(info === 'true'){
            res.write(JSON.stringify(newway));
        }else{
            res.write(JSON.stringify(data));
        }
        res.end();
    }
}).listen(port);
