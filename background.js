chrome.runtime.onInstalled.addListener(function() {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [
                new chrome.declarativeContent.PageStateMatcher({
                    pageUrl: {
                        urlMatches: "pso2.jp/players/catalog/(?:ac|sg|sp)scratch/[0-9]{8}_[0-9]{2}/"
                    }
                })
            ],
            actions: [new chrome.declarativeContent.ShowAction()]
        }]);
    });
});