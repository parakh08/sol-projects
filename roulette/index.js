var figlet = require('figlet');
var inquirer = require('inquirer');
// var chalk = require('chalk');
// import chalk from 'chalk';

const web3 = require("@solana/web3.js");
const { getReturnAmount, totalAmtToBePaid, randomNumber } = require('./helper');
const {getWalletBalance,transferSOL,airDropSol}=require("./solana");

var AmtToBePaid, ReturnAmount, PlayerGuess, contractCurrVal, playerCurrVal;

// Generating wallet pairs for game and player
const gameWallet = web3.Keypair.generate();
const userSecretKey = [
    138, 204,  88, 114, 127,   7,  60,  37,
    162, 128, 155, 128, 146, 215, 211, 185,
    127,   0,  46, 115,  75, 217, 186, 140,
    237, 179,  49,  35, 104, 210,   5,  69,
    142,  56, 124,  45,  53,  30,  14, 212,
    225,  31,  58, 236,  41,  87, 110, 251,
    134,  31, 105, 109,  78, 145,  55, 193,
     56, 158,  66, 131,   3, 160,  17, 247
]
const PlayerWallet = web3.Keypair.fromSecretKey(Uint8Array.from(userSecretKey));


// airdropping 2 sol into playerwallet to let him play 
const airdropping=async()=>{
    await airDropSol(gameWallet.publicKey.toString());
    console.log("Airdropped into game's wallet!")
};

// const publicKey = userWallet.publicKey.toString()
// const secretKey = userWallet.secretKey
// const userWallet=web3.Keypair.fromSecretKey(Uint8Array.from(userSecretKey)); // Generating the wallet instance from just the secretkey

//defining questions to be asked
const questions1 = [
    {
      type: 'number',
      name: 'staking',
      message: 'What is the amount of SOL you want to stake?',
    },
    {
        type: 'number',
        name: 'ratio',
        message: 'What is your the ratio of your staking?',
    },
];
const questions2 = [
    {
        type: 'number',
        name: 'guess',
        message: 'Guess a random number between 1 and 5, both included'
    }  
]

// Printing initial of game
const initialisegame=async()=>{
    await figlet('SOL Stake!!', function(err, data) {
        if (err) {
            console.log('Something went wrong...');
            console.dir(err);
            return;
        }
        console.log(data);
        // console.log(chalk.yellow`The max bidding amount is 0.5 SOL here along with max ratio of 4`);
    });
}

// Getting the answers of questions
const anskingquestions=async ()=>{
    //asking the two questions
    await inquirer.prompt(questions1).then((answers) => {
        // console.log(JSON.stringify(answers, null, '  '));
        AmtToBePaid = totalAmtToBePaid(answers.staking);
        ReturnAmount = getReturnAmount(answers.staking,answers.ratio);
        console.log('You need to pay %d to move forward', AmtToBePaid);
        console.log('You will get %d if guessing the number correctly', ReturnAmount);
    });

    playerCurrVal = await getWalletBalance(PlayerWallet.publicKey.toString());
    console.log('Current value of Player is %d', playerCurrVal);

    await inquirer.prompt(questions2).then(answers => {
        PlayerGuess = answers.guess;
    });    

    //transferring sol from player to game wallet
    await transferSOL(PlayerWallet, gameWallet, AmtToBePaid);
    playerCurrVal = await getWalletBalance(PlayerWallet.publicKey.toString());
    console.log('Current value of Player is %d', playerCurrVal);

    if(PlayerGuess==randomNumber(1,5)){
        // player is correct so funds need to be transferred from game to player
        await transferSOL(gameWallet, PlayerWallet, ReturnAmount);
        console.log("Congratulation! Your guess was correct, you have won!")
    } else{
        console.log("Sorry, Your guess was wrong!")
    }

    playerCurrVal = await getWalletBalance(PlayerWallet.publicKey.toString());
    console.log('Current value of Player is %d', playerCurrVal);
}

// Driver function
const gameExecution = async () => {
    await airdropping();
    await initialisegame();
    await anskingquestions();
}
gameExecution();