function showReactionDiv(commid){
    var showReactions = document.querySelector('#showReactions');
    var showReactionsTotal = document.querySelector('#showReactionsTotal');
    var showReactionUser = document.querySelector('.showReactionUser');
    fetch(`/comment/${commid}/showReacts`)
    .then(foundData => foundData.json())
    .then(function(reactions){
        showReactions.innerHTML = "";
        showReactions.innerHTML = `<div class="showReactionsHeader">
        <div class="showReactionsNum">
            <i class="fas fa-thumbs-up"></i>
            <p id="showReactionsTotal">${reactions.length} Likes</p>
        </div>
        <div id="closeReactions">
            <i class="fas fa-times"></i>
        </div>
    </div>`;
        for(var i=0;i<reactions.length;i++){
            showReactions.innerHTML += `<a href= /profile/${reactions[i]._id} class="showReactionUser">
            <div class="showReactionUserImg">
                <img src=${reactions[i].profilePhoto} alt="">
            </div>
            <p class="showReactionUserName">${reactions[i].name}</p>
        </a>`
        }
        showReactions.style.display = "block";
        var closeReactions = document.querySelector('#closeReactions');
        closeReactions.addEventListener('click',function(){
            showReactions.style.display = "none";
        })
    })
}
