// Getting the return amount if the guess is correct
exports.getReturnAmount= (amount, ratio)=>{
    return amount*ratio;
}

// Getting the total amount to be paid by player for each game
exports.totalAmtToBePaid= (amount)=>{
    return amount;
}

// Getting the random number between min and max
exports.randomNumber= (min, max)=>{
    return Math.floor(Math.random() * (max - min + 1) + min);
}