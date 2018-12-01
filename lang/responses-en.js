module.exports = 
{
  "bap": [
	"{author} smacks {input} hard on the snoot with a rolled up news paper!",
    "{author} goes to smack {input} on the snoot with a news paper, but missed and hit themself!"
  ],
  "boop": [
    "{author} has booped {input}!\nOwO",
    "{author} lightly pokes the nose of {input}!\nOwO"
  ],
  "cuddle": [
    "{author} has cuddled {input}!\nThey're so cute!",
    "{author} sneaks up behind {input} and cuddles them!\nIsn't that sweet!"
  ],
  "dictionary": [
    "{author} throws a dictionary at {input} screaming KNOWLEDGE!!",
    "{author} drops some knowledge on {input}, with their dictionary!",
    "{author} drops their entire english homework folder onto {input}. It seems it flattened them!\nMust be a lot of homework!"
  ],
  "flop": [
    "{author} flops over onto {input}!\nOof",
    "{author} lays on {input}.. owo",
    "{author} jumps onto {input}!\nYikes! Hopefully they aren't too heavy!"
  ],
  "furpile": {
    0: "{author} starts a furpile on {user}!\nTo join type `{prefix}furpile`!",
    1: "{author} joins a furpile on {user}!\nThey now have {count} fur on them!",
    3: "{author} climbs onto the furs ontop of {user}!\nThey now have {count} furs on them!",
    5: "{author} scales the mountain of furs on {user} to join them!\nThey now have {count} furs on them!",
    7: [
      "{author} hops ontop of the massive furpile on {user}!\nThey now have {count} furs on them!",
      "Poor {user}, you furs must be crushing them!"
    ],
    8: "{author} joins a furpile on {user}!\nThey now have {count} furs on them!",
	"else": "{author} joins a furpile on {user}!\nThey now have {count} furs on them!",
	text: ((count)=>{
		if(isNaN(count)) return false;
		switch(count) {
			case 0:
				return lang.en.furpile[0];
				break;
			case 1:
			case 2:
				return lang.en.furpile[1];
				break;
			case 3:
			case 4:
				return lang.en.furpile[3];
				break;
			case 5:
			case 6:
				return lang.en.furpile[5];
				break;
			case 7:
				return lang.en.furpile[7];
				break;
			case 8:
				return lang.en.furpile[8];
				break;
			default: 
				return lang.en.furpile.else;
		}
	})
  },
  "glomp": [
    "{author} pounces onto {input}, tackling them to the floor in a giant hug! {author} whispers \"I love you~\" quitely into {input}'s ear."
  ],
  "hug": [
    "{author} sneaks up beind {input}, and when they aren't looking, tackles them from behind in the biggest hug ever!\nAww",
	"{author} gently wraps their arms around {input}!",
	"{author} wraps their arms around {input}, giving them a big warm hug!"
  ],
  "kiss": [
    "{author} kisses {input}!\nThey must be in love!\n:blue_heart:",
    "{author} kisses {input}!\nCute!"
  ],
  "lick": [
    "{author} licks {input}\nUwU",
    "{author} decides to make {input}'s fur a little slimy..."
  ]
};