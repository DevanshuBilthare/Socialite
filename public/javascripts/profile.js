

function validate(event){
    const postContentText = document.querySelector('#postContentText');
    const fileInput = document.querySelector('#file-input');

    if(postContentText.value == "" && fileInput.files.length == 0){
        event.preventDefault();
    }
    if(fileInput.files.length > 0){
        if(fileInput.files[0].size > 1024*1024){
            event.preventDefault();
            alert('Size should be less than 1 mb');
        }
    }
}

function validateCoverSize(event){
    var fileInput = document.querySelector('#coverPhotoBtn');
    if(fileInput.files.length > 0){
        if(fileInput.files[0].size > 1024*1024){
            event.preventDefault();
            alert('Size should be less than 1 mb');
        }
    }
}

function validateProfileSize(event){
    var fileInput = document.querySelector('#profilePhotoBtn');
    if(fileInput.files.length > 0){
        if(fileInput.files[0].size > 1024*1024){
            event.preventDefault();
            alert('Size should be less than 1 mb');
        }
    }
}

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
                <img src= ${reactions[i].profilePhoto} alt="">
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

function showEditPostDiv(postId){
    var postDelUpdate = document.querySelector('#postDelUpdate');
    postDelUpdate.innerHTML = "";
    fetch(`/update/${postId}/caption`)
    .then(foundCaption => foundCaption.json())
    .then(function(foundCaption){
        postDelUpdate.innerHTML =  `<h3 class="postUpdateHeader">Edit Post</h3>
        <form action= /update/${postId}/caption method="POST" onsubmit="checkCaptionInput(event,'${foundCaption.media}')">
            <textarea name="caption" id="updateCaptionInput" placeholder="Enter Caption..." maxlength="500">${foundCaption.content}</textarea>
            <div class="postUpdateOptsContainer">
                <input type="submit" class="postUpdateOpts" value="Update">
                <div class="postUpdateOpts" id="hidePostDelUpdate">Cancel</div>
            </div>
        </form>`;
        postDelUpdate.style.display = "block";
        var hidePostDelUpdate = document.querySelector('#hidePostDelUpdate');
        hidePostDelUpdate.addEventListener('click',function(){
            postDelUpdate.style.display = "none";
        })
    })
}

function checkCaptionInput(event,post){
    var updateCaptionInput = document.querySelector('#updateCaptionInput');
    if(updateCaptionInput.value.trim() == "" && post == 'null' ){
        event.preventDefault();
        alert("Enter Caption");
    }
}

function showDelPostDiv(postId){
    var postDelUpdate = document.querySelector('#postDelUpdate');
    postDelUpdate.innerHTML = "";
    postDelUpdate.innerHTML = `<div class="postDelHeader">
    <i class="fas fa-exclamation-triangle"></i>
    <h3>Delete This Post?</h3>
</div>
<p class="postDelAlert">Are you sure you want to permanently delete this post? Deleted items cannot be restored again.</p>
<div class="postDelOptsContainer">
    <a href="javascript:void(0)" onclick="location.href= '/delete/${postId}'" class="postDelOpts">Delete</a>
    <button id="closePostDelDiv" class="postDelOpts">Cancel</button>
</div>`
    postDelUpdate.style.display = "block";
    var closePostDelDiv = document.querySelector('#closePostDelDiv');
    closePostDelDiv.addEventListener('click',function(){
        postDelUpdate.style.display = "none";
    })
}

function showDelCommentDiv(commentId,postId){
    var postDelUpdate = document.querySelector('#postDelUpdate');
    postDelUpdate.innerHTML = "";
    postDelUpdate.innerHTML = `<div class="postDelHeader">
    <i class="fas fa-exclamation-triangle"></i>
    <h3>Delete This Comment?</h3>
</div>
<p class="postDelAlert">Are you sure you want to permanently delete this comment? Deleted items cannot be restored again.</p>
<div class="postDelOptsContainer">
    <a href= /delete/comment/${commentId}/${postId} class="postDelOpts">Delete</a>
    <button id="closeCommentDel" class="postDelOpts">Cancel</button>
</div>`
    postDelUpdate.style.display = "block";
    var closeCommentDel = document.querySelector('#closeCommentDel');
    closeCommentDel.addEventListener('click',function(){
        postDelUpdate.style.display = "none";
    })
}

function showEditCommentDiv(commentId){
    var postDelUpdate = document.querySelector('#postDelUpdate');
    postDelUpdate.innerHTML = "";
    fetch(`/update/${commentId}/comment`)
    .then(foundComment => foundComment.json())
    .then(function(foundComment){
        postDelUpdate.innerHTML =  `<h3 class="postUpdateHeader">Edit Comment</h3>
        <form action= /update/comment/${commentId} method="POST" onsubmit="checkCommentInput(event)">
            <textarea name="comment" id="updateCmntText" placeholder="Enter Comment...">${foundComment}</textarea>
            <div class="postUpdateOptsContainer">
                <input type="submit" class="postUpdateOpts" value="Update">
                <div class="postUpdateOpts" id="hideCommentDelUpdate">Cancel</div>
            </div>
        </form>`;
        postDelUpdate.style.display = "block";
        var hideCommentDelUpdate = document.querySelector('#hideCommentDelUpdate');
        hideCommentDelUpdate.addEventListener('click',function(){
            postDelUpdate.style.display = "none";
        })
    })

}
function checkCommentInput(event){
    var updateCmntText = document.querySelector('#updateCmntText');
    if(updateCmntText.value.trim() == ""){
        event.preventDefault();
        alert("Enter Comment");
    }
}
