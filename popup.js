document.addEventListener("DOMContentLoaded", function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        var activeTab = tabs[0];
        if (validWebsite(activeTab.url)) {
            document.getElementById('itemlistButton').onclick = onClick_DownloadItemListJson
            document.getElementById('bonuslistButton').onclick = onClick_DownloadBonusListJson
            document.getElementById('itemImageButton').onclick = onClick_DownloadItemImages
        } else {
            $('#validWebsite').hide()
            $('#invalidWebsite').show()
        }
    });
})

function validWebsite(url) {
    var validRegex = "pso2.jp\/players\/catalog\/(?:ac|sg|sp)scratch\/[0-9]{8}_[0-9]{2}\/"
    var itemRegex = "item"

    return url.match(validRegex) != null && url.match(itemRegex) == null
}

function onClick_DownloadItemListJson() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        var activeTab = tabs[0];
        console.log(tabs[0])
        var itemlistJson = new URL("js/itemlist.json", activeTab.url).href
        chrome.downloads.download({
            url: itemlistJson
        });
    });
}

function onClick_DownloadBonusListJson() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        var activeTab = tabs[0];
        console.log(tabs[0])
        var itemlistJson = new URL("js/bonuslist.json", activeTab.url).href
        chrome.downloads.download({
            url: itemlistJson
        });
    });
}

function onClick_DownloadItemImages() {
    /*chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        var activeTab = tabs[0];
        $.ajax({
            url: "./js/itemlist.json",
            type: "GET",
            dataType: "json"
        }).then(data => {
            var imagesList = []
            for (var index = 0; index < data.length; index++) {
                const illust = data[index].illust.split(","),
                    screenshot = data[index].ss.split(",")

                if (data[index].ss.length > 1)
                    for (let l = 0; l < screenshot.length; l++) {
                        imagesList.append(new URL("../../img/item/ss/" + screenshot[l] + ".jpg", activeTab.url).href)
                    }
                else if (illust.length > 1) {
                    for (let l = 0; l < illust.length; l++) {
                        let n = "";
                        if (illust[l].match("il")) {
                            imagesList.append(new URL("../../img/item/illust/" + illust[l].replace("il", "") + ".png", activeTab.url).href)
                        } else {
                            imagesList.append(new URL("img/ss/" + illust[l] + ".png", activeTab.url).href)
                        }
                    }
                } else {
                    imagesList.append(new URL("img/ss/" + illust[0] + ".png", activeTab.url).href)
                }
            }

        })
    })*/
}
//chrome.downloads.download({
//    url: "http://upload.wikimedia.org/wikipedia/commons/6/6e/Moonbeam_UFO.JPG"
//});