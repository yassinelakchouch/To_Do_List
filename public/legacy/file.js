//declare all main variables 
let container = document.getElementsByClassName("container0")[0];
let svg = document.getElementsByClassName("save")[0];
let input = document.getElementsByTagName("input")[0];
//main function :
function start(){
  var newElement = document.createElement("p")
  var span = document.createElement("span");
  var nNode = newElement.cloneNode(true);
  if(input.value!=""&&input.value.toLowerCase()!=input.value.toUpperCase()){
  nNode.innerHTML = input.value;
  input.value = "";
  span.innerHTML = "&#9746;";
  span.classList.add("span")
  nNode.classList.add("newElement")
  container.appendChild(nNode);
  nNode.appendChild(span);
  span.setAttribute("title","delete");
 var p = document.getElementsByClassName("newElement");
 var del = document.getElementsByClassName("span");

 function checked(){
     for(let i in p){
           p[i].onclick = (event)=>{ 
            try{
            if(p[i].attributes[0].nodeValue.includes("changeBG")){
            p[i].classList.remove("changeBG");
            p[i].classList.add("returnCol");
          }
            else{
              if(p[i].attributes[0].nodeValue.includes("returnColV1")){
                try{
                p[i].classList.remove("returnColV1");}
                catch(error){
                  //do nothing...
                }
                console.log("yp")
              }else{
            p[i].classList.remove("returnCol")
            p[i].classList.add("changeBG");}
          }
                    }
             catch(error){
                 //dont do something
             }
    }
}
  }
  function delItem(){
      let k = p.length;
    for(let i=0;i<k;++i){
        del[i].onclick = (event)=>{
           container.removeChild(p[i]);
           p[i].classList.add("returnColV1")
           setInterval(delItem,500);
        }
    }
}

setInterval(delItem,200);
setInterval(checked,100);
}
    else{
        $('.alert').addClass("show");
        $('.alert').removeClass("hide");
        $('.alert').addClass("showAlert");
        setTimeout(function(){
          $('.alert').removeClass("show");
          $('.alert').addClass("hide");
        },5000);
      $('.close-btn').click(function(){
        $('.alert').removeClass("show");
        $('.alert').addClass("hide");})
    }
  }
//for button click :
svg.onclick = ()=>{
  start();
}
//for Enter button :
input.addEventListener("keydown", function (e) {
  if (e.code === "Enter") {  //checks whether the pressed key is "Enter"
   start();
  }
});