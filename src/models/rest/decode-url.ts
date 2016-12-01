export function decodeUrl(url: string): Object {
    let regex = /[?&]([^=#]+)=([^&#]*)/g,
        params = {},
        match;
    while (match = regex.exec(url)) {
        params[decodeURIComponent(match[1])] = decodeURIComponent(match[2]);
    }
    let paramsObject = <Object>params;
    for (let p in paramsObject) {
        if( paramsObject[p] === undefined ) {
            delete paramsObject[p];
            continue;
        }
        if(paramsObject.hasOwnProperty(p)) {
            // chcek if property is number
            let n = Number(params[p]);
            if (!isNaN(n)) {
                params[p] = n;
                continue;
            }
            if (typeof params[p] === 'string') {

                // check if property is object
                let json;
                try {
                    json = JSON.parse(params[p]);
                } catch (error) { }
                if (json !== undefined) {
                    params[p] = json;
                    continue;
                }

                // chcek if property value is like regular rexpression
                // let regexExpression;
                // try {
                //     regexExpression = new RegExp(params[p]);
                // } catch (e) { }
                // if (regexExpression !== undefined) params[p] = regexExpression;
            }
        }
    }
    return params;
}