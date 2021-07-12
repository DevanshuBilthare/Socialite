var searchBar = document.querySelector('#searchBar');
var searchResultsContainer = document.querySelector('#searchResultsContainer');
searchBar.addEventListener('input',function(){
    searchResultsContainer.innerHTML = "";
    var strParts;
    if (true){
        if(searchBar.value.trim() != ""){
            fetch(`/search/${searchBar.value}`)
            .then(results => results.json())
            .then(function(searchRes){
                if(searchRes.length != 0){
                    searchResultsContainer.innerHTML = "";
                    searchRes.forEach(function(search){
                        
                        strParts = `<a href=/profile/${search._id} class="searchResults">
                        <img src= ${search.profilePhoto}>
                        <div class="searchResultDets">
                        <div class="searchResultDetsTop">
                            <h4>${search.username}</h4>`;
                            if(search.isVerified){
                                strParts += `<img class="isVerifiedLogo" src="data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAwIDAgNTExLjM3NSA1MTEuMzc1IiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMS4zNzUgNTExLjM3NSIgd2lkdGg9IjUxMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Zz48cGF0aCBkPSJtNTExLjM3NSAyNTUuNjg3LTU3Ljg5LTY0LjI3MyA5LjA2NC04Ni4wNDUtODQuNjUtMTcuOTIxLTQzLjE4LTc1LjAxMS03OS4wMzEgMzUuMzItNzkuMDMxLTM1LjMyLTQzLjE4IDc1LjAxMS04NC42NSAxNy45MjEgOS4wNjMgODYuMDQ1LTU3Ljg5IDY0LjI3MyA1Ny44ODkgNjQuMjczLTkuMDYzIDg2LjA0NSA4NC42NSAxNy45MjEgNDMuMTggNzUuMDExIDc5LjAzMS0zNS4zMjEgNzkuMDMxIDM1LjMyMSA0My4xOC03NS4wMTEgODQuNjUtMTcuOTIxLTkuMDY0LTg2LjA0NXptLTE0OC40OTctNTUuOTg1LTEyOC4zNDUgMTQzLjc5Mi04OS4xODYtODkuMTg2IDIxLjIxMy0yMS4yMTMgNjYuNzM0IDY2LjczNCAxMDcuMjAzLTEyMC4xMDR6Ii8+PC9nPjwvc3ZnPg==" />`;
                            }
                            strParts +=`
                        </div>
                            
                            <p>${search.name}</p>
                        </div>
                    </a>`;
                    searchResultsContainer.innerHTML += strParts;
                    strParts = "";
                })
                }
                else{
                    
                    searchResultsContainer.innerHTML = `<div class="searchResults">
                            <h4 class="nores">No results found</h4>
                    </div>`
                }
                
            })
        }
    }
    else{
        searchResultsContainer.innerHTML += `<div class="searchResults">
                            <h4 class="nores">No results found</h4>
                    </div>`
    }        
})

const setting = document.querySelector('#settingBtn');
const menu = document.querySelector('#menu');
const body = document.querySelector('body');
const nav = document.querySelector('nav');
var height = window.innerHeight
|| document.documentElement.clientHeight
|| document.body.clientHeight
// if(height < 570){
//     menu.style.height = `${height -75}px`;
// }else{
//     menu.style.height = `${height}px`;
// }
if(height <= 400){
    searchResultsContainer.style.maxHeight = `${height-150}px`;
}else if(height < 600 && height>400){
    searchResultsContainer.style.maxHeight = `${height-250}px`;
}


var isOpen = false;
setting.addEventListener('click',function(){
    if(!isOpen){
        if(document.body.clientWidth > 600){
            menu.style.width = '400px';
         }
        else{
            menu.style.width = '300px';
        }
        isOpen = true;        
        body.style.overflow = "hidden";
    }
    else{
        menu.style.width = '0px';
        isOpen = false;
        body.style.overflow = "unset";
    }
    
});