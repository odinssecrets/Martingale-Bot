var blackStreak;
var redStreak;
var baseBet;
var initialBalance;
var maxLoss;
var maxWin;
var neverStopWinning;
var stopBot;
var currentHash;

function startBot(){
	//Get ready
	cleanUp();
	ClearBets();
	//Store starting balance
	initialBalance = balance;
	//Get user parameters
	var initialBet = parseInt(prompt("Enter base bet: Ð"));
	maxLoss = parseInt(prompt("Enter maximum loss: Ð"));
	maxWin = parseInt(prompt("Enter amount of winnings to stop at: Ð"));
	//Check for special cases of maxLoss/Win
	if(maxLoss == 0 || maxLoss > initialBalance){
		maxLoss = initialBalance;
	}
	if(maxWin <= 0){
		neverStopWinning = true;
	}
	//Tell user and log to console
	alert("Martingale BOT starting - enter forceQuit() to stop immediately.");
	log("Initial balance is :: Ð" + balance);
	log("Base bet size is :: Ð" + baseBet);
	log("Attempted winnings :: Ð" + maxWin);
	log("Maximum allowed losses :: Ð" + maxLoss);
	//Begin betting
	if(balance>=initialBet)
	{
		baseBet = initialBet;
		bet(initialBet);
	}
}

function forceQuit(){
	stopBot = true;
	return;
}

function bet(betAmount){
	if(currentHash!=spinHash){
		//Check to see if bot should stop
		if(stopBot || betAmount > balance)
		{
			if(betAmount > balance)
				alert("Current bet size larger than available balance. You have lost! :(");
			cleanUp();
			return;
		}
		var streakStr;
		if(blackStreak>redStreak)
			streakStr  = "Current Streak of " + blackStreak + " black."
		else
			streakStr  = "Current Streak of " + redStreak + " red."
		//Log current winnings/losses
		if(balance - initialBalance > 0)
			log("Current standings :: Ð +" + (balance - initialBalance) + ":: With Bet Amount :: Ð" +betAmount + " :: " + streakStr + " :: Spin Hash :: " + spinHash);
		else
			log("Current standings :: Ð " + (balance - initialBalance) + ":: With Bet Amount :: Ð" +betAmount + " :: " + streakStr + " :: Spin Hash :: " + spinHash);

		//Stop if reached bottom or top limits
		if(!neverStopWinning && balance - initialBalance >=  maxWin){
			alert("You have won!");
			stopBot = true;
			cleanUp();
			return;
		}else if(-1*(balance - initialBalance) >= maxLoss){
			alert("You have reached maximum allowed losses!");
			stopBot = true;
			cleanUp();
			return;
		}/*else if(-1*(balance - initialBalance - betAmount) > maxLoss){
			betAmount = (-1*(balance - initialBalance - betAmount) - maxLoss);
		}*/
		//Clear table
		ClearBets();
		//Add bet to table
		ModAddBet(document.getElementById("cell-red"),1,betAmount);
		//Set to turbo spin
		document.getElementById("instaspin").checked = true;
		
		ModSpin(betAmount);
	}
}

function cleanUp(){
	//Clear Console
	clear();
	//Clean table
	ClearBets();
	//Reset variables
	blackStreak = 0;
	redStreak = 0;
	baseBet = 0;
	initialBalance = 0;
	maxLoss = 0;
	maxWin = 0;
	currentHash = 0;
	//Set global bools to false
	neverStopWinning = false;
	stopBot = false;
}

function log(str){
 console.log(str);
}

//Modified AddBet a tiny to make it easier to use 

function ModAddBet(target,direction,betSize) {
	if (isSpinning)
		return;
	
	//Set current hash
	currentHash = spinHash;
	
	var e;
	var chipVal = (betSize);
		
	if (direction == -1) {
		if (e = document.getElementById("coin-" + target.id))
		{
			e = document.getElementById("coinLabel-" + target.id);
			var currentChipVal = parseFloat(e.innerHTML);
			var newChipVal = currentChipVal - chipVal;
			if (newChipVal <= 0) {
				e = document.getElementById("coin-" + target.id);
				e.parentNode.removeChild(e);
			} else
				e.innerHTML = Strip(newChipVal);
			
			PlaySound("chips",soundEnabledSoundFX);
		}
		BuildBet();
		Unhighlight(target);
		return;
	}
	
	PlaySound("chips",soundEnabledSoundFX);
	
	if (e = document.getElementById("coin-" + target.id)) {
		e = document.getElementById("coinLabel-" + target.id);
		var currentChipVal = parseFloat(e.innerHTML);
		var newChipVal = chipVal + currentChipVal;
		e.innerHTML = Strip(newChipVal);
		BuildBet();
		Unhighlight(target);
		return;
	}
		
	ele = document.createElement('div');
	ele.className = "betMarker";
	ele.id = "coin-" + target.id;
	ele.style.position="absolute";
	ele.style.zIndex = 600;
	ele.style.pointerEvents = "none";
	ele.style.width = 32;
	ele.style.height = 32;	
	ele.innerHTML = '<img src="/assets/gfx/chip.png" width="32" height="32"/><div id="coinLabel-' + target.id + '" class="coinLabel">' + chipVal + '</div>';

	if (target.className=="corner") {
		ele.style.top="-11px";
		ele.style.left="-11px";
		target.appendChild(ele);
	} else if (target.className=="horizSplit") {
		ele.style.top="-11px";
		ele.style.left="8px";
		target.appendChild(ele);
	} else if (target.className=="vertSplit") {
		ele.style.top="5px";
		ele.style.left="-11px";
		target.appendChild(ele);
	} else {
		ele.style.left=(target.offsetLeft+13)+"px";
		ele.style.top=(target.offsetTop+12)+"px";
		document.getElementById("splitsOverlay").appendChild(ele);
	}
	var betID = target.ID;
	
	BuildBet();
	Unhighlight(target);
} 

//A couple small modifications to the existing Spin() function
function ModSpin(betAmount) {
	//Store old balance to check after spin
	var oldBal = balance;
   
    clearTimeout(respinTimer);
    if (isSpinning)
        return;
    BuildBet();
    if (rouletteBet == "")
        return;
    clearTimeout(unhighlightWinTimer);
    isSpinning = true;
    var instaspin = true;
    var autospin = true;
	var lastSpins = document.getElementById("lastSpins");
    var buttonGroup = document.getElementById("buttonGroup");
    var innerWheel = document.getElementById("innerWheel");
    var innerWheel = document.getElementById("outerWheel");
    var noMoreBets = document.getElementById("noMoreBets");
    var chipSize = document.getElementById("chipSize");
    var ballResult = document.getElementById("ballResult");
    var summary = document.getElementById("summary");
    var spinHashDisplay = document.getElementById("spinHashDisplay");
    var previousHashDisplay = document.getElementById("previousHashDisplay");
    var previousHashDataDisplay = document.getElementById("previousHashDataDisplay");
    var eles = document.querySelectorAll(".zeroCell,.redBox,.blackBox,.redBoxHi,.blackBoxHi");
    for (var i = 0; i < eles.length; i++)
        eles[i].classList.remove('winningNum');
    eles = document.querySelectorAll(".coinWinLabel");
    for (var i = 0; i < eles.length; i++)
        eles[i].parentNode.removeChild(eles[i]);
    ballResult.classList.remove("ballResultRed");
    ballResult.classList.remove("ballResultBlack");
    ballResult.classList.remove("ballResultGreen");
    ballResult.style.display = "none";
    summary.style.display = "none";
    buttonGroup.style.display = "none";
    chipSize.style.display = "none";
    noMoreBets.style.display = "block";
    var waitRotator = setInterval(function() {
        currAngle += 3;
        $("#innerWheel").rotate(currAngle);
    }, 1);
    var req = GetXmlHttpRequest();
    req.onreadystatechange = function() {

		var res = new String(req.responseText);
        if (res != '') {
            if (res == "ERROR") {
                clearInterval(waitRotator);
                noMoreBets.style.display = "none";
                buttonGroup.style.display = "block";
                chipSize.style.display = "block";
                $("#innerWheel").rotate(0);
                isSpinning = false;
                StopSound("spinning");
                document.getElementById("autospin").checked = false;
				log("ERROR!");
            } else {
                StopSound("spinning");
                if (!instaspin)
                    PlaySound("falling", soundEnabledSoundFX);
                var resSplit = res.split(":");
                var spinResult = parseInt(resSplit[0]);
                balance = Strip(parseFloat(resSplit[1]));
                var betCost = Strip(parseFloat(resSplit[2]));
                var winAmount = Strip(parseFloat(resSplit[3]));
                var change = 0;
                if (resSplit[4].indexOf('E') === -1)
                    change = Strip(parseFloat(resSplit[4]));
                var oldHash = resSplit[5];
                var oldHashData = resSplit[6];
                spinHash = resSplit[7];
                var wheelAngle = GetWheelAngle(spinResult);
                $("#innerWheel").rotate(0);
                var delay = 3000;
                if (instaspin) {
                    delay = 0;
                    $("#innerWheel").rotate(1440 - wheelAngle);
                } else
                    $("#innerWheel").rotate({
                        animateTo: 1440 - wheelAngle,
                        duration: delay
                    });
                clearInterval(waitRotator);
                setTimeout(function() {
                    isSpinning = false;
                    var winningCell = document.getElementById("cell-" + spinResult);
                    for (var i = 8; i < resSplit.length; i++) {
                        if (resSplit[i] == "")
                            continue;
                        var winningBet = resSplit[i].split(";");
                        var amount = winningBet[1];
                        var ele = document.getElementById(winningBet[0]);
                        var winLabel = document.createElement('div');
                        winLabel.className = "coinWinLabel";
                        winLabel.id = "winLabel-" + winningBet[0];
                        winLabel.innerHTML = "+" + winningBet[1];
                        ele.appendChild(winLabel);
                    }
                    ShowBalanceChange(change);
                    if (change >= 0 && !instaspin) {
                        if (winAmount > (betCost * 10))
                            PlaySound("bigwin", soundEnabledSoundFX);
                        else
                            PlaySound("coins", soundEnabledSoundFX);
                    }
                    summary.innerHTML = "Bet: " + betCost + " Returned: " + winAmount;
                    if (!autospin) {
                        noMoreBets.style.display = "none";
                        buttonGroup.style.display = "block";
                        summary.style.display = "block";
                        chipSize.style.display = "block";
                    }
                    if (winningCell.className == "redBox")
                        ballResult.classList.add("ballResultRed");
                    else if (winningCell.className == "zeroCell")
                        ballResult.classList.add("ballResultGreen");
                    else
                        ballResult.classList.add("ballResultBlack");
                    ballResult.innerHTML = spinResult;
                    ballResult.style.display = "block";
                    winningCell.classList.add('winningNum');
                    spinHashDisplay.value = spinHash;
                    previousHashDataDisplay.value = oldHashData;
                    previousHashDisplay.value = oldHash;
                    if (!instaspin)
                        PlaySound(spinResult, soundEnabledVoiceFX);
                    unhighlightWinTimer = setTimeout(function() {
                        winningCell.classList.remove('winningNum');
                        var eles = document.querySelectorAll(".coinWinLabel");
                        for (var i = 0; i < eles.length; i++)
                            eles[i].parentNode.removeChild(eles[i]);
                    }, 5000);
                    var spinDisplay = "<span class='";
                    if (spinResult == 0)
                        spinDisplay += "numZero";
                    else if (reds.indexOf(spinResult) != -1)
                        spinDisplay += "numRed";
                    else
                        spinDisplay += "numBlack";
                    spinDisplay += "'>" + spinResult + "</span> ";
                    lastSpins.innerHTML = spinDisplay + lastSpins.innerHTML;
					BuildBet();
	
					//Check whether to double or restart
					if (balance >= oldBal){
						bet(baseBet)
						redStreak++;
						blackStreak = 0;
					}else{
						bet(2*betAmount);
						blackStreak++;
						redStreak = 0;
					}
                }, delay);
            }
        }
    };
    var params;
    if (mode == "playmoney")
        params = "mode=playmoney&bet=" + rouletteBet + "&balance=" + balance + "&spinHash=" + spinHash;
    else
        params = "mode=realmoney&bet=" + rouletteBet + "&spinHash=" + spinHash + "&secretURL=" + secretURL;
    SendAJAXRequest(req, "/ajax-roulette-spin.php", params);
}
