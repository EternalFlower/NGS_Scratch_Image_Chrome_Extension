const validSite = "pso2.(jp|com)\/players\/catalog\/(ac|sg|sp)scratch\/([0-9]{8}_[0-9]{2})\/"
var domain = window.location.href
var region = null
var scratchData = {
    name: null,
    id: null,
    type: null,
    itemData: null,
    bonusData: null
}

ValidSite()

function ValidSite() {
    var regexMatch = domain.match(validSite)

    if (regexMatch != null) {
        region = regexMatch[1]
        scratchData.type = regexMatch[2]
        scratchData.id = regexMatch[3]
        GetData()
    }
}

function GetData() {
    $.ajax({
        url: "js/itemlist.json",
        type: "GET",
        dataType: "json"
    }).then(data => {
        scratchData.itemData = data

        if (region == "jp") {
            scratchData.name = scratchData.itemData[0].scratchname
        } else {
            scratchData.name = scratchData.itemData[0].scratchname_en
        }
    })

    $.ajax({
        url: "js/bonuslist.json",
        type: "GET",
        dataType: "json"
    }).then(data => {
        scratchData.bonusData = data
    })
}

function UrlToPromise(url) {
    return new Promise(function(resolve, reject) {
        JSZipUtils.getBinaryContent(url, function(err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

function Command_DownloadImages(ListType) {
    if (ListType == "itemlist") {
        DownloadItemImages("itemlist", scratchData.itemData)
    } else if (ListType == "bonuslist") {
        DownloadItemImages("bonuslist", scratchData.bonusData)
    } else {
        DownloadItemImages("itemlist", scratchData.itemData)
        DownloadItemImages("bonuslist", scratchData.bonusData)
    }
}

function DownloadItemImages(ListType, ListData) {
    let ImagesList = []

    for (var index = 0; index < ListData.length; index++) {
        const illust = ListData[index].illust.split(","),
            screenshot = ListData[index].ss.split(",")

        if (ListData[index].ss.length > 1)
            for (let l = 0; l < screenshot.length; l++) {
                ImagesList.push([`${screenshot[l]}.jpg`, new URL(`../../img/item/ss/${screenshot[l]}.jpg`, domain).href])
            }
        else if (illust.length > 1) {
            for (let l = 0; l < illust.length; l++) {
                let n = "";
                if (illust[l].match("il")) {
                    ImagesList.push([`${illust[l].replace("il", "")}.png`, new URL(`../../img/item/illust/${illust[l].replace("il", "")}.png`, domain).href])
                } else {
                    ImagesList.push([`${illust[l]}.png`, new URL(`img/ss/${illust[l]}.png`, domain).href])
                }
            }
        } else if (illust[0].match("icon")) {
            continue;
        } else {
            ImagesList.push([`${illust[0]}.png`, new URL(`img/ss/${illust[0]}.png`, domain).href])
        }
    }

    let zip = JSZip()

    ImagesList.forEach(image => {
        zip.file(image[0], UrlToPromise(image[1]), { binary: true });
    })

    zip.generateAsync({ type: "blob" }).then(function callback(blob) {
        saveAs(blob, `${scratchData.type}${scratchData.id}_${ListType}_${scratchData.name}_images.zip`)
    });
}