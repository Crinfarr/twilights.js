const config = require('./config');
const Discord = require(`discord.js`);
const fs = require('fs');
const mh = require('magic-home');
const Jimp = require('jimp');
const { Control } = require('magic-home');
const request = require('request').defaults({encoding:null});
let image;

var args = process.argv;
const client = new Discord.Client();

client.once('ready', () => {
    console.log(`Successfully logged in as ${client.user.tag}!`)
});

async function getImg(url, path) {
    return new Promise(resolve => {
        request.get(url, function (error, response, body) {
            fs.writeFileSync(path, Buffer.from(body));
            resolve();
        });
    })
}

client.on('message', async msg => {
        if (msg.content.toLowerCase().includes("daddy") && config.daddymode) {
            msg.channel.send(":weary:");
        }

        if (!msg.content.startsWith(config.discord.prefix) || msg.author.bot) return; //don't respond to messages not calling it
        console.log(`${msg.author.username}: ${msg.content} [in: ${msg.guild.name}]`); //log command call

        args = msg.content.slice(config.discord.prefix.length).trim().split(' '); //get command and arguments
        command = args.shift().toLowerCase(); //take command, leave arguments

        switch (command) {
            case ('downrez'):
                //check to see if both arguments are specified:
                if (args.length != 2) {
                    return msg.channel.send("Usage: downrez [width] [height]");
                }

                //if both args are numbers
                else if (msg.attachments.size == 1) { //if there's only one attachment
                    try {
                        console.log(msg.attachments.array()[0].url);
                        var imgurl = msg.attachments.array()[0].url; //get image url
                        var extension = imgurl.split(".")[imgurl.split(".").length - 1]; //use image url to get extension
                        var path = `./tmpimages/image.${extension}`;
                        var rspath = `./rstmpimages/rsimage.${extension}`;
                        getImg(imgurl, path).then(function() {
                            Jimp.read(path).then(img => {
                                img.contain(parseInt(args[0]), parseInt(args[1])).autocrop().write(rspath);
                            }).then(function() {
                                /*var embed = new Discord.MessageEmbed()
                                    .setTitle(`:black_large_square:Here's your image resized to ${args[0]} by ${args[1]}!`)
                                    .attachFiles([rspath])
                                    .setImage(`attachment://rsimage.${extension}`);
                                msg.channel.send(embed);*/
                                attachment = new Discord.MessageAttachment(rspath);
                                msg.channel.send(`Here's your image resized to ${args[0]} by ${args[1]}, <@${msg.author.id}>!`, attachment);
                            }).finally(function() {
                                fs.unlinkSync(path);
                                fs.unlinkSync(rspath);
                            });
                        })
                        
                    }
                    catch(err) {
                        msg.channel.send(`:x: JS Error: ${err}`);
                    }
                }
                else if (msg.attachments.size > 1) {
                    msg.channel.send(':x: Too many attachments!');

                }
                else if (msg.attachments.size < 1) {
                    msg.channel.send(':x: no valid attachment!');

                }
                else {
                    msg.channel.send(':x: Unknown error!');

                }
            case("lighton"): 
                if (args.length != 1) {
                    msg.channel.send("Usage: lighton [light]\n\nUse !lights for a list of lights.");
                }
                else {
                    var ctrl = new Control(config.lighting.lights[config.lighting.lightindexes[args[0]]].address);
                    ctrl.turnOn();
                }
                break;
            case("lightoff"):
                if (args.length != 1) {
                    msg.channel.send("Usage: lightoff [light]\n\nUse !lights for a list of lights.");
                }
                else {
                    var ctrl = new Control(config.lighting.lights[config.lighting.lightindexes[args[0]]].address);
                    ctrl.turnOff();
                }
                break;
            case("lightcolor"):
                
                break;
            case("lights"):
                msg.channel.send(config.lighting.lightdesc);
                console.log(config.lighting.lights);
                break;
            default:
                break;
        }
    });

client.login(config.discord.token);