// function validate(event){
//     var name = document.querySelector('#name').value;
//     var password = document.querySelector('#password').value;
//     var contact = document.querySelector('#contact').value;
//     var namealert = document.querySelector('#namealert');
//     var passalert = document.querySelector('#passalert');
//     var contactalert = document.querySelector('#contactalert');
//     namealert.style.display = "none";
//     passalert.style.display = "none";
//     contactalert.style.display = "none";
//     if(!/^[A-Za-z\s]+$/.test(name)){
//         namealert.style.display = "block";
//         event.preventDefault();
//     }
//     else if(!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$/.test(password)){
//         passalert.style.display = "block";
//         event.preventDefault();
//     }
//     else if(!/^\d{10}$/.test(contact)){
//         contactalert.style.display = "block";
//         event.preventDefault();
//     }
// }
