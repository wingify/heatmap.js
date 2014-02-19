/*
 * heatmap.js 1.0 -    JavaScript Heatmap Library
 *
 * Copyright (c) 2011, Patrick Wied (http://www.patrick-wied.at)
 * Dual-licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * and the Beerware (http://en.wikipedia.org/wiki/Beerware) license.
 */

(function(w){
    // the heatmapFactory creates heatmap instances
    var heatmapFactory = (function(){

    // store object constructor
    // a heatmap contains a store
    // the store has to know about the heatmap in order to trigger heatmap updates when datapoints get added
    var store = function store(hmap){

        var _ = {
            // data is a two dimensional array
            // a datapoint gets saved as data[point-x-value][point-y-value]
            // the value at [point-x-value][point-y-value] is the occurrence of the datapoint
            data: [],
            // tight coupling of the heatmap object
            heatmap: hmap
        };
        // the max occurrence - the heatmaps radial gradient alpha transition is based on it
        this.max = 0;
        this.get = function(key){
            return _[key];
        };
        this.set = function(key, value){
            _[key] = value;
        };
    }

    store.prototype = {
        // function for adding datapoints to the store
        // datapoints are usually defined by x and y but could also contain a third parameter which represents the occurrence
        addDataPoint: function(x, y){
            var data = this.get("data");
            data[x] = data[x] || [];
            data[x][y] = (data[x][y] || 0) + 1;

            // do we have a new maximum?
            if(this.max < data[x][y])
                this.max = data[x][y];
            this.set("data",data);
        },
        Draw: function() {
            var data = this.get("data"), heatmap = this.get("heatmap");
            for(var x in data)
                for(var y in data[x])
                    if(!isNaN(x) && !isNaN(y) && !isNaN(data[x][y]))
                        heatmap.drawAlpha(x, y, data[x][y]);
        }
    };

    // heatmap object constructor
    function heatmap(config){
        // private variables
        var _ = {
            radiusIn : 5,
            radiusOut : 13,
            element : {},
            canvas : {},
            acanvas: {},
            ctx : {},
            actx : {},
            visible : true,
            width : 0,
            height : 0,
            max : false,
            gradient : false,
            opacity: 180
        };
        // heatmap store containing the datapoints and information about the maximum
        // accessible via instance.store
        this.store = new store(this);

        this.get = function(key){
            return _[key];
        },
        this.set = function(key, value) {
            _[key] = value;
        };
        // configure the heatmap when an instance gets created
        this.configure(config);
        // and initialize it
        this.init();
    };

    // public functions
    heatmap.prototype = {
        configure: function(config){
                if(config.radius){
                    var rout = config.radius,
                    rin = parseInt(rout/2);
                }
                this.set("radiusIn", this.get('radiusIn')),
                this.set("radiusOut", this.get('radiusOut')),
                this.set("element", (config.element instanceof Object)?config.element:document.getElementById(config.element));
                this.set("visible", config.visible);
                this.set("max", config.max || false);
                this.set("gradient", config.gradient || { 0: "rgb(0,0,255)", 0.25: "rgb(0,255,255)", 0.5: "rgb(0,255,0)", 0.75: "yellow", 1.0: "rgb(255,0,0)"});    // default is the common blue to red gradient
                this.set("opacity", parseInt(255/(100/config.opacity), 10) || 180);
                this.set("width", config.width || 0);
                this.set("height", config.height || 0);
        },
        init: function(){
                this.initColorPalette();
                var canvas = document.createElement("canvas"),
                acanvas = document.createElement("canvas"),
                element = this.get("element");
                this.set("canvas", canvas);
                this.set("acanvas", acanvas);
                canvas.width = acanvas.width = element.style.width.replace(/px/,"") || this.getWidth(element);
                this.set("width", canvas.width);
                canvas.height = acanvas.height = element.style.height.replace(/px/,"") || this.getHeight(element);
                this.set("height", canvas.height);
                canvas.style.position = acanvas.style.position = "absolute";
                canvas.style.top = acanvas.style.top = "0";
                canvas.style.left = acanvas.style.left = "0";
                canvas.style.zIndex = 1000000;
                if(!this.get("visible"))
                    canvas.style.display = "none";

                this.get("element").appendChild(canvas);
                try {
                    canvas.getContext("2d")
                } catch(e) {
                    parent.G_vmlCanvasManager.initElement(canvas);
                    parent.G_vmlCanvasManager.initElement(acanvas);
                }
                this.set("ctx", canvas.getContext("2d"));
                this.set("actx", acanvas.getContext("2d"));
        },
        initColorPalette: function(){
//         var canvas = document.createElement("canvas");
//         canvas.width = "1";
//         canvas.height = "256";
//         var ctx;
//         ctx = canvas.getContext("2d");
//         var grad = ctx.createLinearGradient(0,0,1,256),
//         gradient = this.get("gradient");
//         for(var x in gradient){
//             grad.addColorStop(x, gradient[x]);
//         }
//
//         ctx.fillStyle = grad;
//         ctx.fillRect(0,0,1,256);
//         var data = ctx.getImageData(0,0,1,256).data
//         var str = ''
//         for(k in data){
//              str+=k+': '+data[k]+','}
//         console.log(str);
//         this.set("gradient", ctx.getImageData(0,0,1,256).data);
//         delete canvas;
//         delete grad;
//         delete ctx;
            var grad = {
                    0: 0,1: 1,2: 255,3: 255,4: 0,5: 5,6: 255,7: 255,8: 0,9: 8,10: 255,11: 255,12: 0,13: 12,14: 255,15: 255,16: 0,17: 16,18: 255,19: 255,20: 0,21: 20,22: 255,23: 255,24: 0,25: 24,26: 255,27: 255,28: 0,29: 27,30: 255,31: 255,32: 0,33: 31,34: 255,35: 255,36: 0,37: 38,38: 255,39: 255,40: 0,41: 42,42: 255,43: 255,44: 0,45: 47,46: 255,47: 255,48: 0,49: 50,50: 255,51: 255,52: 0,53: 53,54: 255,55: 255,56: 0,57: 57,58: 255,59: 255,60: 0,61: 61,62: 255,63: 255,64: 0,65: 66,66: 255,67: 255,68: 0,69: 69,70: 255,71: 255,72: 0,73: 72,74: 255,75: 255,76: 0,77: 76,78: 255,79: 255,80: 0,81: 80,82: 255,83: 255,84: 0,85: 84,86: 255,87: 255,88: 0,89: 88,90: 255,91: 255,92: 0,93: 91,94: 255,95: 255,96: 0,97: 95,98: 255,99: 255,100: 0,101: 99,102: 255,103: 255,104: 0,105: 103,106: 255,107: 255,108: 0,109: 111,110: 255,111: 255,112: 0,113: 114,114: 255,115: 255,116: 0,117: 118,118: 255,119: 255,120: 0,121: 122,122: 255,123: 255,124: 0,125: 126,126: 255,127: 255,128: 0,129: 130,130: 255,131: 255,132: 0,133: 133,134: 255,135: 255,136: 0,137: 137,138: 255,139: 255,140: 0,141: 141,142: 255,143: 255,144: 0,145: 145,146: 255,147: 255,148: 0,149: 148,150: 255,151: 255,152: 0,153: 152,154: 255,155: 255,156: 0,157: 155,158: 255,159: 255,160: 0,161: 160,162: 255,163: 255,164: 0,165: 163,166: 255,167: 255,168: 0,169: 167,170: 255,171: 255,172: 0,173: 171,174: 255,175: 255,176: 0,177: 175,178: 255,179: 255,180: 0,181: 178,182: 255,183: 255,184: 0,185: 186,186: 255,187: 255,188: 0,189: 190,190: 255,191: 255,192: 0,193: 194,194: 255,195: 255,196: 0,197: 198,198: 255,199: 255,200: 0,201: 201,202: 255,203: 255,204: 0,205: 205,206: 255,207: 255,208: 0,209: 209,210: 255,211: 255,212: 0,213: 212,214: 255,215: 255,216: 0,217: 217,218: 255,219: 255,220: 0,221: 220,222: 255,223: 255,224: 0,225: 224,226: 255,227: 255,228: 0,229: 227,230: 255,231: 255,232: 0,233: 231,234: 255,235: 255,236: 0,237: 236,238: 255,239: 255,240: 0,241: 239,242: 255,243: 255,244: 0,245: 242,246: 255,247: 255,248: 0,249: 246,250: 255,251: 255,252: 0,253: 250,254: 255,255: 255,256: 0,257: 255,258: 252,259: 255,260: 0,261: 255,262: 248,263: 255,264: 0,265: 255,266: 244,267: 255,268: 0,269: 255,270: 241,271: 255,272: 0,273: 255,274: 237,275: 255,276: 0,277: 255,278: 233,279: 255,280: 0,281: 255,282: 230,283: 255,284: 0,285: 255,286: 225,287: 255,288: 0,289: 255,290: 222,291: 255,292: 0,293: 255,294: 218,295: 255,296: 0,297: 255,298: 214,299: 255,300: 0,301: 255,302: 211,303: 255,304: 0,305: 255,306: 207,307: 255,308: 0,309: 255,310: 202,311: 255,312: 0,313: 255,314: 199,315: 255,316: 0,317: 255,318: 195,319: 255,320: 0,321: 255,322: 192,323: 255,324: 0,325: 255,326: 188,327: 255,328: 0,329: 255,330: 180,331: 255,332: 0,333: 255,334: 176,335: 255,336: 0,337: 255,338: 173,339: 255,340: 0,341: 255,342: 169,343: 255,344: 0,345: 255,346: 165,347: 255,348: 0,349: 255,350: 161,351: 255,352: 0,353: 255,354: 157,355: 255,356: 0,357: 255,358: 153,359: 255,360: 0,361: 255,362: 150,363: 255,364: 0,365: 255,366: 146,367: 255,368: 0,369: 255,370: 142,371: 255,372: 0,373: 255,374: 138,375: 255,376: 0,377: 255,378: 134,379: 255,380: 0,381: 255,382: 131,383: 255,384: 0,385: 255,386: 128,387: 255,388: 0,389: 255,390: 124,391: 255,392: 0,393: 255,394: 119,395: 255,396: 0,397: 255,398: 116,399: 255,400: 0,401: 255,402: 112,403: 255,404: 0,405: 255,406: 104,407: 255,408: 0,409: 255,410: 101,411: 255,412: 0,413: 255,414: 97,415: 255,416: 0,417: 255,418: 93,419: 255,420: 0,421: 255,422: 89,423: 255,424: 0,425: 255,426: 85,427: 255,428: 0,429: 255,430: 82,431: 255,432: 0,433: 255,434: 78,435: 255,436: 0,437: 255,438: 74,439: 255,440: 0,441: 255,442: 70,443: 255,444: 0,445: 255,446: 67,447: 255,448: 0,449: 255,450: 63,451: 255,452: 0,453: 255,454: 59,455: 255,456: 0,457: 255,458: 55,459: 255,460: 0,461: 255,462: 52,463: 255,464: 0,465: 255,466: 48,467: 255,468: 0,469: 255,470: 44,471: 255,472: 0,473: 255,474: 41,475: 255,476: 0,477: 255,478: 32,479: 255,480: 0,481: 255,482: 29,483: 255,484: 0,485: 255,486: 25,487: 255,488: 0,489: 255,490: 21,491: 255,492: 0,493: 255,494: 18,495: 255,496: 0,497: 255,498: 14,499: 255,500: 0,501: 255,502: 9,503: 255,504: 0,505: 255,506: 6,507: 255,508: 0,509: 255,510: 2,511: 255,512: 2,513: 255,514: 0,515: 255,516: 5,517: 255,518: 0,519: 255,520: 9,521: 255,522: 0,523: 255,524: 13,525: 255,526: 0,527: 255,528: 17,529: 255,530: 0,531: 255,532: 20,533: 255,534: 0,535: 255,536: 24,537: 255,538: 0,539: 255,540: 27,541: 255,542: 0,543: 255,544: 32,545: 255,546: 0,547: 255,548: 39,549: 255,550: 0,551: 255,552: 43,553: 255,554: 0,555: 255,556: 47,557: 255,558: 0,559: 255,560: 51,561: 255,562: 0,563: 255,564: 54,565: 255,566: 0,567: 255,568: 58,569: 255,570: 0,571: 255,572: 62,573: 255,574: 0,575: 255,576: 66,577: 255,578: 0,579: 255,580: 70,581: 255,582: 0,583: 255,584: 73,585: 255,586: 0,587: 255,588: 77,589: 255,590: 0,591: 255,592: 81,593: 255,594: 0,595: 255,596: 84,597: 255,598: 0,599: 255,600: 89,601: 255,602: 0,603: 255,604: 92,605: 255,606: 0,607: 255,608: 96,609: 255,610: 0,611: 255,612: 99,613: 255,614: 0,615: 255,616: 103,617: 255,618: 0,619: 255,620: 111,621: 255,622: 0,623: 255,624: 115,625: 255,626: 0,627: 255,628: 118,629: 255,630: 0,631: 255,632: 122,633: 255,634: 0,635: 255,636: 126,637: 255,638: 0,639: 255,640: 130,641: 255,642: 0,643: 255,644: 134,645: 255,646: 0,647: 255,648: 137,649: 255,650: 0,651: 255,652: 141,653: 255,654: 0,655: 255,656: 145,657: 255,658: 0,659: 255,660: 149,661: 255,662: 0,663: 255,664: 153,665: 255,666: 0,667: 255,668: 156,669: 255,670: 0,671: 255,672: 160,673: 255,674: 0,675: 255,676: 164,677: 255,678: 0,679: 255,680: 168,681: 255,682: 0,683: 255,684: 172,685: 255,686: 0,687: 255,688: 175,689: 255,690: 0,691: 255,692: 179,693: 255,694: 0,695: 255,696: 186,697: 255,698: 0,699: 255,700: 190,701: 255,702: 0,703: 255,704: 195,705: 255,706: 0,707: 255,708: 198,709: 255,710: 0,711: 255,712: 201,713: 255,714: 0,715: 255,716: 206,717: 255,718: 0,719: 255,720: 209,721: 255,722: 0,723: 255,724: 213,725: 255,726: 0,727: 255,728: 217,729: 255,730: 0,731: 255,732: 220,733: 255,734: 0,735: 255,736: 224,737: 255,738: 0,739: 255,740: 228,741: 255,742: 0,743: 255,744: 232,745: 255,746: 0,747: 255,748: 236,749: 255,750: 0,751: 255,752: 240,753: 255,754: 0,755: 255,756: 243,757: 255,758: 0,759: 255,760: 247,761: 255,762: 0,763: 255,764: 251,765: 255,766: 0,767: 255,768: 255,769: 252,770: 0,771: 255,772: 255,773: 248,774: 0,775: 255,776: 255,777: 244,778: 0,779: 255,780: 255,781: 240,782: 0,783: 255,784: 255,785: 236,786: 0,787: 255,788: 255,789: 232,790: 0,791: 255,792: 255,793: 229,794: 0,795: 255,796: 255,797: 225,798: 0,799: 255,800: 255,801: 221,802: 0,803: 255,804: 255,805: 217,806: 0,807: 255,808: 255,809: 214,810: 0,811: 255,812: 255,813: 210,814: 0,815: 255,816: 255,817: 206,818: 0,819: 255,820: 255,821: 202,822: 0,823: 255,824: 255,825: 198,826: 0,827: 255,828: 255,829: 195,830: 0,831: 255,832: 255,833: 191,834: 0,835: 255,836: 255,837: 187,838: 0,839: 255,840: 255,841: 179,842: 0,843: 255,844: 255,845: 176,846: 0,847: 255,848: 255,849: 172,850: 0,851: 255,852: 255,853: 168,854: 0,855: 255,856: 255,857: 165,858: 0,859: 255,860: 255,861: 160,862: 0,863: 255,864: 255,865: 157,866: 0,867: 255,868: 255,869: 153,870: 0,871: 255,872: 255,873: 149,874: 0,875: 255,876: 255,877: 146,878: 0,879: 255,880: 255,881: 142,882: 0,883: 255,884: 255,885: 138,886: 0,887: 255,888: 255,889: 134,890: 0,891: 255,892: 255,893: 130,894: 0,895: 255,896: 255,897: 127,898: 0,899: 255,900: 255,901: 123,902: 0,903: 255,904: 255,905: 119,906: 0,907: 255,908: 255,909: 115,910: 0,911: 255,912: 255,913: 112,914: 0,915: 255,916: 255,917: 104,918: 0,919: 255,920: 255,921: 100,922: 0,923: 255,924: 255,925: 96,926: 0,927: 255,928: 255,929: 93,930: 0,931: 255,932: 255,933: 88,934: 0,935: 255,936: 255,937: 85,938: 0,939: 255,940: 255,941: 82,942: 0,943: 255,944: 255,945: 78,946: 0,947: 255,948: 255,949: 73,950: 0,951: 255,952: 255,953: 70,954: 0,955: 255,956: 255,957: 66,958: 0,959: 255,960: 255,961: 63,962: 0,963: 255,964: 255,965: 59,966: 0,967: 255,968: 255,969: 54,970: 0,971: 255,972: 255,973: 51,974: 0,975: 255,976: 255,977: 47,978: 0,979: 255,980: 255,981: 43,982: 0,983: 255,984: 255,985: 40,986: 0,987: 255,988: 255,989: 32,990: 0,991: 255,992: 255,993: 28,994: 0,995: 255,996: 255,997: 24,998: 0,999: 255,1000: 255,1001: 21,1002: 0,1003: 255,1004: 255,1005: 17,1006: 0,1007: 255,1008: 255,1009: 13,1010: 0,1011: 255,1012: 255,1013: 9,1014: 0,1015: 255,1016: 255,1017: 5,1018: 0,1019: 255,1020: 255,1021: 2,1022: 0,1023: 255,length: 1024
            }
            this.set("gradient", grad);
        },
        getWidth: function(element){
            var width = element.offsetWidth;
            if(element.style.paddingLeft)
                width+=element.style.paddingLeft;
            if(element.style.paddingRight)
                width+=element.style.paddingRight;

            return width;
        },
        getHeight: function(element){
            var height = element.offsetHeight;
            if(element.style.paddingTop)
                height+=element.style.paddingTop;
            if(element.style.paddingBottom)
                height+=element.style.paddingBottom;

            return height;
        },
        colorize: function(x, y){
                // get the private variables
                var width = this.get("width"),
                radiusOut = this.get("radiusOut"),
                height = this.get("height"),
                actx = this.get("actx"),
                ctx = this.get("ctx");

                var x2 = radiusOut*2;

                if(x+x2>width)
                    x=width-x2;
                if(x<0)
                    x=0;
                if(y<0)
                    y=0;
                if(y+x2>height)
                    y=height-x2;
                // get the image data for the mouse movement area
                var image = actx.getImageData(x,y,x2,x2),
                // some performance tweaks
                    imageData = image.data,
                    length = imageData.length,
                    palette = this.get("gradient"),
                    opacity = this.get("opacity");
                // loop thru the area
                for(var i=3; i < length; i+=4){

                    // [0] -> r, [1] -> g, [2] -> b, [3] -> alpha
                    var alpha = imageData[i],
                    offset = alpha*4;

                    if(!offset)
                        continue;

                    // we ve started with i=3
                    // set the new r, g and b values
                    imageData[i-3]=palette[offset];
                    imageData[i-2]=palette[offset+1];
                    imageData[i-1]=palette[offset+2];
                    // we want the heatmap to have a gradient from transparent to the colors
                    // as long as alpha is lower than the defined opacity (maximum), we'll use the alpha value
                    imageData[i] = (alpha < opacity)?alpha:opacity;
                }
                // the rgb data manipulation didn't affect the ImageData object(defined on the top)
                // after the manipulation process we have to set the manipulated data to the ImageData object
                image.data = imageData;
                ctx.putImageData(image,x,y);
        },
        drawAlpha: function(x, y, count){
                // storing the variables because they will be often used
                var r1 = this.get("radiusIn"),
                r2 = this.get("radiusOut"),
                ctx = this.get("actx"),
                max = this.get("max"),
                // create a radial gradient with the defined parameters. we want to draw an alphamap
                rgr = ctx.createRadialGradient(x,y,r1,x,y,r2),
                xb = x-r2, yb = y-r2, mul = 2*r2;
                // the center of the radial gradient has .1 alpha value
                //rgr.addColorStop(0, 'rgba(0,0,0,'+ (count ? count/(this.store.max * 0.25 ) : '0')+')');
                if(count==this.store.max) rgr.addColorStop(0, 'rgba(0,0,0,1)');
                else rgr.addColorStop(0, 'rgba(0,0,0,' + ((Math.log(count)/Math.log(this.store.max)) + (count/this.store.max))/2+ ')');
                // and it fades out to 0
                rgr.addColorStop(1, 'rgba(0,0,0,0)');
                // drawing the gradient
                ctx.fillStyle = rgr;
                ctx.fillRect(xb,yb,mul,mul);
                // finally colorize the area
                this.colorize(xb,yb);
        },
        toggleDisplay: function(){
                var me = this,
                    visible = me.get("visible"),
                canvas = me.get("canvas");

                if(!visible)
                    canvas.style.display = "block";
                else
                    canvas.style.display = "none";

                me.set("visible", !visible);
        },
        // dataURL export
        getImageData: function(){
                return this.get("canvas").toDataURL();
        },
        clear: function(){
            var me = this,
                w = me.get("width"),
                h = me.get("height");

            me.store.set("data",[]);
            // @TODO: reset stores max to 1
            //me.store.max = 1;
            me.get("ctx").clearRect(0,0,w,h);
            me.get("actx").clearRect(0,0,w,h);
        },
        cleanup: function(){
            var me = this;
            me.get("element").removeChild(me.get("canvas"));
        }
    };

    return {
            create: function(config){
                return new heatmap(config);
            },
            util: {
                mousePosition: function(ev){
                    // this doesn't work right
                    // rather use
                    /*
                        // this = element to observe
                        var x = ev.pageX - this.offsetLeft;
                        var y = ev.pageY - this.offsetTop;

                    */
                    var x, y;

                    if (ev.layerX) { // Firefox
                        x = ev.layerX;
                        y = ev.layerY;
                    } else if (ev.offsetX) { // Opera
                        x = ev.offsetX;
                        y = ev.offsetY;
                    }
                    if(typeof(x)=='undefined')
                        return;

                    return [x,y];
                }
            }
        };
    })();
    w.h337 = heatmapFactory;
})(window);