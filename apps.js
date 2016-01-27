//-------------------------------------------------
//   PEBBLE JS                                V0.4a
//               __  __    ____   _____
//              / / / /   /  _/  / ___/
//             / /_/ /    / /    \__ \ 
//            / __  /_  _/ / _  ___/ / 
//           /_/ /_/(_)/___/(_)/____/    
//           HOME INTELLIGENT SYSTEM
//
//_________________________________________________


//----------------------------------------------------------------------------------------------------
// TO DO
// Voir s'il est possible de trouver des icones attention à mettre dans les titres 
// Terminer les actions sur la gestion de l'éclairage 
// Lite des températures de la maison 
// Récupérer les temps de trajets travail / maison
// Rajouter une icône à l'application
//----------------------------------------------------------------------------------------------------

var ui = require('ui');
var ajax = require('ajax');
var Accel = require('ui/accel'); Accel.init();
var Vibe = require('ui/vibe');


//var Vector2 = require('vector2');

// VAR INIT GLOBAL
var vmc_status="??";
var alarme_status="??";
var z0_status = "??"; var z1_status = "??"; var z2_status = "??"; //HEATER ZONE STATUS

// eedomus connexion values
var url_api_eedomus = "http://api.eedomus.com";
var api_key = "xxxxxxxxx";
var api_user = "xxxxxxxxx";
var http_eedomus_get=url_api_eedomus+'/get?api_user='+api_user+'&api_secret='+api_key+'&'; 
var http_eedomus_set=url_api_eedomus+'/set?api_user='+api_user+'&api_secret='+api_key+'&';
    

// STATIC CARD/DISPLAY
var Welcome_Card = new ui.Card({backgroundColor: 'magenta', textColor: 'white', title: 'H.I.S v0.4', subtitle: 'Récupération des états...'}); // RETRIEVING STATE
var Wait_Card    = new ui.Card({backgroundColor: 'grey', textColor: 'black', title: 'Loading...', subtitle: 'Please wait'});
var Error_Card   = new ui.Card({backgroundColor: 'red', textColor: 'white', title: "ERREUR", body:"Pas de réseau, url invalide, box non joignable ?" }); // NO NETWORK ERROR

var Menu_General = new ui.Menu({
   backgroundColor: 'blue', textColor: 'white',
   sections: [{      
      title:"H.I.S v0.4", // SECTION TITLE 
      items: [        
        { title: 'CHAUFFAGE', subtitle: 'Z0:'+z0_status+' | Z1:'+z1_status+' | Z2:'+z2_status },
        { title: 'ECLAIRAGE', subtitle: 'xx on | xx off' },
        { title: 'VMC', subtitle: vmc_status },
        { title: 'ALARME', subtitle: alarme_status }
        ]
    }]
});

var Menu_Chauffage = new ui.Menu({ 
    backgroundColor: 'orange', textColor: 'white',
    sections: [{ title:"HIS / CHAUFFAGE", 
    items: [  { title: 'TOUT CONFORT' }, { title: 'TOUT ECO' }, { title: 'TOUT HORS GEL' },
              { title: 'RDC CONFORT' }, { title: 'RDC ECO' }, { title: '1ER CONFORT' }, 
              { title: '1ER ECO' },{ title: '2EME CONFORT' }, { title: '2EME ECO' }]    
    }]
});

var Menu_Eclairage = new ui.Menu({ 
    backgroundColor: 'yellow', textColor: 'black',
    sections: [{ title:"HIS / ECLAIRAGE", 
    items: [ { title: 'SALON' }, { title: 'ENTREE' }, { title: 'SALLE DE JEU' }, { title: 'LIT SP' },  ]    
    }]
});


var Menu_Vmc = new ui.Menu({ 
      backgroundColor: 'green', textColor: 'white',
      sections: [{ title:"HIS / VMC : "+vmc_status,
      items: [ { title: 'VITESSE 1 (30min)' }, { title: 'VITESSE 2(30MIN)' }, { title: 'VITESSE 1' }, { title: 'VITESSE 2' }, {  title: 'OFF' } ]
    }]
});

var Menu_Alarme = new ui.Menu({ 
      backgroundColor: 'red', textColor: 'white',  
      sections: [{ title:"HIS / ALARME : "+alarme_status,
      items: [ { title: 'DESACTIVER' }, { title: 'ACTIVER' }, {  title: 'SIRENE OFF' } ]
    }]
});


//0. REFRESH SHAKING -------------------

Menu_General.on('accelTap', function(e) { 
                                          Vibe.vibrate('short');  
                                          Welcome_Card.show();
  
                                          Chauffage_Refresh_Status();
                                          Vmc_Refresh_Status();
                                          Alarme_Refresh_Status();
                                          Eclairage_Status();
  
                                          setTimeout(function() {Welcome_Card.hide();  Menu_General.show();  }, 1000); // 1 seconds      
                                          });
// 1. START -------------------

//Welcome_Card.show();

Menu_General.show(); 

Vmc_Refresh_Status();
Alarme_Refresh_Status();
Chauffage_Refresh_Status();
Eclairage_Status();

//setTimeout(function() {Welcome_Card.hide();  Menu_General.show();  }, 2000); // 2 secondes
   
   Menu_General.on('select', function(e) {
    switch(e.itemIndex) {
      case 0:  Menu_Chauffage.show(); break; // CHAUFFAGE  0
      case 1:  Menu_Eclairage.show(); break; // ECLAIRAGE  1
      case 2:  Menu_Vmc.show();       break; // VMC        2
      case 3:  Menu_Alarme.show();    break; // ALARME     3       
      default: 
    } 
  });


// 2. MENU ON -------------------

Menu_Alarme.on('select', function(e) {
    switch(e.itemIndex) {
      case 0:  Alarme_Set("DESACTIVER");  break;
      case 1:  Alarme_Set("ACTIVER");     break;
      case 2:  Alarme_Set("SIRENE OFF");  break;        
      default: 
    } 
  });


Menu_Vmc.on('select', function(e) {
    switch(e.itemIndex) {
      case 0:  Vmc_Set("V1_30M");  break;
      case 1:  Vmc_Set("V2_30M");  break;
      case 2:  Vmc_Set("V1");      break;
      case 3:  Vmc_Set("V2");      break;
      case 4:  Vmc_Set("OFF");     break;        
      default: 
    } 
  });

Menu_Chauffage.on('select', function(e) {
    switch(e.itemIndex) {
      case 0:  Chauffage_Set("TOUT CONFORT");  break;
      case 1:  Chauffage_Set("TOUT ECO");      break;
      case 2:  Chauffage_Set("TOUT HORS GEL"); break; 
      case 3:  Chauffage_Set("RDC CONFORT");   break;
      case 4:  Chauffage_Set("RDC ECO");       break;        
      case 5:  Chauffage_Set("1ER CONFORT");   break;        
      case 6:  Chauffage_Set("1ER ECO");       break;        
      case 7:  Chauffage_Set("2EME CONFORT");  break;  
      case 8:  Chauffage_Set("2EME ECO");      break;        
      default: 
      
    } 
  });


// FUNCTION ----------------------------HEATING SYSTEM (Status : DONE)---------------------------------------------


function Chauffage_Refresh_Status() {
  
    var z0_status_url=http_eedomus_get+'action=periph.caract&periph_id=192161';
    ajax( { url: z0_status_url, type:'json' }, 
    // success
    function(z0_json) { z0_status=z0_json.body.last_value_text;
                       if(z0_status=="CONFORT") {z0_status="CO";}
                       if(z0_status=="ECO"    ) {z0_status="EC";}
                       if(z0_status=="HORS"   ) {z0_status="HG";}
                       if(z0_status=="AUTO"   ) {z0_status="AU";}                       
                         // update menu general
                        Menu_General.item(0,0, {subtitle: 'Z1:'+z0_status+'  Z2:'+z1_status+'  Z3:'+z2_status});                       
                       }, 
   function(error) {  alarme_status="Error !"; console.log('Erreur acces url Chauffage Z0');                     
    }); // AJAX         
  
    var z1_status_url=http_eedomus_get+'action=periph.caract&periph_id=192167';
    ajax( { url: z1_status_url, type:'json' }, 
    // success
    function(z1_json) { z1_status=z1_json.body.last_value_text;
                       if(z1_status=="CONFORT") {z1_status="CO";}
                       if(z1_status=="ECO"    ) {z1_status="EC";}
                       if(z1_status=="HORS"   ) {z1_status="HG";}
                       if(z1_status=="AUTO"   ) {z1_status="AU";}                       
                         // update menu general
                         Menu_General.item(0,0, {subtitle: 'Z1:'+z0_status+'  Z2:'+z1_status+'  Z3:'+z2_status}); 
                         Menu_Chauffage.section(0,{title:'Z1:'+z0_status+'  Z2:'+z1_status+'  Z3:'+z2_status});
                       }, 
    function(error) {  alarme_status="Error !"; console.log('Erreur acces url Chauffage Z1');                     
    }); // AJAX
   
    var z2_status_url=http_eedomus_get+'action=periph.caract&periph_id=192168';
    ajax( { url: z2_status_url, type:'json' }, 
    // success
    function(z2_json) { z2_status=z2_json.body.last_value_text;
                       if(z2_status=="CONFORT") {z2_status="CO";}
                       if(z2_status=="ECO"    ) {z2_status="EC";}
                       if(z2_status=="HORS"   ) {z2_status="HG";}
                       if(z2_status=="AUTO"   ) {z2_status="AU";}                       
                         // update menu general
                         Menu_General.item(0,0, {subtitle: 'Z1:'+z0_status+'  Z2:'+z1_status+'  Z3:'+z2_status});                        
                       }, 
    function(error) {  alarme_status="Error !"; console.log('Erreur acces url Chauffage Z2');                     
    }); // AJAX  

}


function Chauffage_Set(chauffage_value) {
var url_chauffage_macro_tout_confort     = http_eedomus_set+'action=periph.macro&macro=263088';  // MACRO TOUT CONFORT HORS GEL
var url_chauffage_macro_tout_eco         = http_eedomus_set+'action=periph.macro&macro=263084';  // MACRO TOUT ECO
var url_chauffage_macro_tout_hors_gel    = http_eedomus_set+'action=periph.value&periph_id=175572&value=7'; // HORS GEL  
var url_chauffage_Z0_confort             = http_eedomus_set+'action=periph.value&periph_id=175572&value=1'; // RDC CONFORT
var url_chauffage_Z0_eco                 = http_eedomus_set+'action=periph.value&periph_id=175572&value=4'; // RDC ECO
var url_chauffage_Z1_confort             = http_eedomus_set+'action=periph.value&periph_id=175572&value=2'; // 1er CONFORT
var url_chauffage_Z1_eco                 = http_eedomus_set+'action=periph.value&periph_id=175572&value=5'; // 1er ECO 
var url_chauffage_Z2_confort             = http_eedomus_set+'action=periph.value&periph_id=175572&value=3'; // 2ème CONF  
var url_chauffage_Z2_eco                 = http_eedomus_set+'action=periph.value&periph_id=175572&value=6'; // 2ème ECO  

var url_chauffage     = "";
  
 var Chauffage_Ok_Card= new ui.Card({ title: "CHAUFFAGE", body: chauffage_value+" : OK !" });

  
if (chauffage_value=="TOUT CONFORT"  ) { url_chauffage=url_chauffage_macro_tout_confort;  z0_status="CO"; z1_status="CO"; z2_status="CO"; }
if (chauffage_value=="TOUT ECO"      ) { url_chauffage=url_chauffage_macro_tout_eco;      z0_status="EC"; z1_status="EC"; z2_status="EC"; }  
if (chauffage_value=="TOUT HORS GEL" ) { url_chauffage=url_chauffage_macro_tout_hors_gel; z0_status="HG"; z1_status="HG"; z2_status="HG";}  
if (chauffage_value=="RDC CONFORT"   ) { url_chauffage=url_chauffage_Z0_confort;          z0_status="CO";}
if (chauffage_value=="RDC ECO"       ) { url_chauffage=url_chauffage_Z0_eco;              z0_status="EC";}  
if (chauffage_value=="1ER CONFORT"   ) { url_chauffage=url_chauffage_Z1_confort;          z1_status="CO";}
if (chauffage_value=="1ER ECO"       ) { url_chauffage=url_chauffage_Z1_eco;              z1_status="EC";}  
if (chauffage_value=="2EME CONFORT"  ) { url_chauffage=url_chauffage_Z2_confort;          z2_status="CO";}
if (chauffage_value=="2EME ECO"      ) { url_chauffage=url_chauffage_Z2_eco;              z2_status="EC";}    
  
  
  
 
  Wait_Card.show();
  ajax( { url: url_chauffage, type:'json' }, 
    // success
    function(json) {
                    Menu_General.item(0,0, {subtitle: 'Z1:'+z0_status+'  Z2:'+z1_status+'  Z3:'+z2_status});
                    Menu_Chauffage.section(0,{title:'Z1:'+z0_status+'  Z2:'+z1_status+'  Z3:'+z2_status});

      Wait_Card.hide();      
      Menu_General.show();
      Chauffage_Ok_Card.hide();
      Menu_Chauffage.hide();
    }, 
    // error
    function(error) {
      Error_Card.show(); Wait_Card.hide();
      setTimeout(function() {Error_Card.hide(); }, 4000); // 4 secondes
      console.log('Erreur acces url CHAUFFAGE');
    });
}


// FUNCTION ----------------------------LIGHT (Status : PENDING - NOT FUNCTIONNAL)---------------------------------------------
var eclairage_salon  ="";
var eclairage_entree ="";
var eclairage_salle_de_jeu ="";
var eclairage_lit_sp ="";

function Eclairage_Status() {
    var eclairage_salon_url        =http_eedomus_get+'action=periph.caract&periph_id=160317'; 
    var eclairage_entree_url       =http_eedomus_get+'ction=periph.caract&periph_id=173216';
    var eclairage_salle_de_jeu_url =http_eedomus_get+'action=periph.caract&periph_id=160997';
    var eclairage_lit_sp_url       =http_eedomus_get+'action=periph.caract&periph_id=161104';  

    var nb_on=0;     var nb_off=0;
  
    ajax( { url: eclairage_salon_url, type:'json' }, 
    // success
    function(lsalon_json)  {  eclairage_salon=lsalon_json.body.last_value_text;
                              if (eclairage_salon=='On')
                              { 
                               nb_on++;                                                          
                               /*
                               // update menu general et menu vmc
                               Menu_General.item(0,2, {subtitle: vmc_status});
                               // update menu vmc section
                               Menu_Vmc.section(0,{title:"VMC : "+vmc_status});
                               */
                              }
                            
                              if (eclairage_salon=='Off')
                              {  
                               nb_off++;
                               /*
                               // update menu general et menu vmc
                               Menu_General.item(0,2, {subtitle: vmc_status});
                               // update menu vmc section
                               Menu_Vmc.section(0,{title:"VMC : "+vmc_status});
                               */
                              }                            
                            console.log('LIGHT SALON : '+eclairage_salon); 
                           }, 
    // error
    function(error) {  eclairage_salon="Error !"; console.log('Erreur acces url Lampadaire Salon Refresh Status');
    }); // AJAX

     ajax( { url: eclairage_entree_url, type:'json' }, 
    // success
    function(lentree_json)  {  eclairage_entree=lentree_json.body.last_value_text;
                              if (eclairage_entree=='On')
                              { 
                               nb_on++;                                                          
                               /*
                               // update menu general et menu vmc
                               Menu_General.item(0,2, {subtitle: vmc_status});
                               // update menu vmc section
                               Menu_Vmc.section(0,{title:"VMC : "+vmc_status});
                               */
                              }
                            
                              if (eclairage_entree=='Off')
                              {  
                               nb_off++;
                               /*
                               // update menu general et menu vmc
                               Menu_General.item(0,2, {subtitle: vmc_status});
                               // update menu vmc section
                               Menu_Vmc.section(0,{title:"VMC : "+vmc_status});
                               */
                              }                            
                            console.log('LIGHT ENTREE : '+eclairage_entree); 
                           }, 
    // error
    function(error) {  eclairage_entree="Error !"; console.log('Erreur acces url Entree Refresh Status');
    }); // AJAX
  
  
     ajax( { url: eclairage_salle_de_jeu_url, type:'json' }, 
    // success
    function(lsdj_json)  {  eclairage_salle_de_jeu=lsdj_json.body.last_value_text;
                              if (eclairage_salle_de_jeu=='On')
                              { 
                               nb_on++;                                                           
                               /*
                               // update menu general et menu vmc
                               Menu_General.item(0,2, {subtitle: vmc_status});
                               // update menu vmc section
                               Menu_Vmc.section(0,{title:"VMC : "+vmc_status});
                               */
                              }
                            
                              if (eclairage_salle_de_jeu=='Off')
                              {  
                               nb_off++;
                               /*
                               // update menu general et menu vmc
                               Menu_General.item(0,2, {subtitle: vmc_status});
                               // update menu vmc section
                               Menu_Vmc.section(0,{title:"VMC : "+vmc_status});
                               */
                              }                            
                            console.log('LIGHT SALLE DE JEU : '+eclairage_salle_de_jeu); 
                           }, 
    // error
    function(error) {  eclairage_salle_de_jeu="Error !"; console.log('Erreur acces url SALLE DE JEU Refresh Status');
    }); // AJAX  
  
ajax( { url: eclairage_lit_sp_url, type:'json' }, 
    // success
    function(llitsp_json)  {  eclairage_lit_sp=llitsp_json.body.last_value_text;
                              if (eclairage_lit_sp=="On")
                              { 
                               nb_on++;                            
                               /*
                               // update menu general et menu vmc
                               Menu_General.item(0,2, {subtitle: vmc_status});
                               // update menu vmc section
                               Menu_Vmc.section(0,{title:"VMC : "+vmc_status});
                               */
                              }
                            
                              if (eclairage_lit_sp=="Off")
                              {  
                               nb_off++;
                               /*
                               // update menu general et menu vmc
                               Menu_General.item(0,2, {subtitle: vmc_status});
                               // update menu vmc section
                               Menu_Vmc.section(0,{title:"VMC : "+vmc_status});
                               */
                              }                            
                            console.log('LIGHT LIT Suite parentale : '+eclairage_lit_sp); 
                           }, 
    // error
    function(error) {  eclairage_lit_sp="Error !"; console.log('Erreur acces url LIT SUITE PARENTALE Refresh Status');
    }); // AJAX    
 
  
  Menu_General.item(0,1, {subtitle: nb_on+' on | '+nb_off+' off'});
    
}

// FUNCTION ----------------------------CMV / VMC (Status : DONE)---------------------------------------------


function Vmc_Refresh_Status() {
    var vmc_status_url=http_eedomus_get+'action=periph.caract&periph_id=254004';
   
    ajax( { url: vmc_status_url, type:'json' }, 
    // success
    function(vmc_json) {  vmc_status=vmc_json.body.last_value_text; 
                          // update menu general et menu vmc
                          Menu_General.item(0,2, {subtitle: vmc_status});
                          // update menu vmc section
                          Menu_Vmc.section(0,{title:"VMC : "+vmc_status});
                          console.log('VMC STATUS : '+vmc_status); 
                       }, 
    // error
    function(error) {  vmc_status="Error !"; console.log('Erreur acces url VMC Refresh Status');
    }); // AJAX
  

}


function Vmc_Set(vmc_value) {
var url_vmc_v1_30M  = http_eedomus_set+'action=periph.macro&macro=262395';
var url_vmc_v2_30M  = http_eedomus_set+'action=periph.macro&macro=262394';
  
var url_vmc_v1  = http_eedomus_set+'action=periph.value&periph_id=174377&value=1';
var url_vmc_v2  = http_eedomus_set+'action=periph.value&periph_id=174377&value=2';
var url_vmc_off = http_eedomus_set+'action=periph.value&periph_id=174377&value=3';  

var url_vmc     = http_eedomus_set+'action=periph.value&periph_id=174377&value=3';
  
var Vmc_Ok_Card = new ui.Card({ title: "VMC",    body: vmc_value+" : OK !" });
  
  if (vmc_value=="V1_30M" ) { url_vmc=url_vmc_v1_30M; vmc_status="VITESSE 1"; }
  if (vmc_value=="V2_30M" ) { url_vmc=url_vmc_v2_30M; vmc_status="VITESSE 2"; }  
  if (vmc_value=="V1"     ) { url_vmc=url_vmc_v1;     vmc_status="VITESSE 1"; }
  if (vmc_value=="V2"     ) { url_vmc=url_vmc_v2;     vmc_status="VITESSE 2"; }  
  if (vmc_value=="OFF"    ) { url_vmc=url_vmc_off;    vmc_status="OFF";       }  
  
 
  Wait_Card.show();
  ajax( { url: url_vmc, type:'json' }, 
    // success
    function(json) {
  
                        Menu_General.item(0,2, {subtitle: vmc_status});
                        // update menu vmc section
                        Menu_Vmc.section(0,{title:"VMC : "+vmc_status});

      Wait_Card.hide();      
      Menu_General.show();
      Vmc_Ok_Card.hide();
      Menu_Vmc.hide();
    }, 
    // error
    function(error) {
      Error_Card.show(); Wait_Card.hide();
      setTimeout(function() {Error_Card.hide(); }, 4000); // 4 secondes
      console.log('Erreur acces url VMC');
    });
}

// FUNCTIONS ----------------------------ALARM (Status : DONE)---------------------------------------------


function Alarme_Refresh_Status() {
var alarme_status_url=http_eedomus_get+'action=periph.caract&periph_id=177001';
    ajax( { url: alarme_status_url, type:'json' }, 
    // success
    function(vmc_json) { alarme_status=vmc_json.body.last_value_text;
                         // update menu general et menu vmc
                         Menu_General.item(0,3, {subtitle: alarme_status});
                         // update menu vmc section
                         Menu_Alarme.section(0,{title:"H.I.S / ALARME : "+alarme_status});
                         if(alarme_status == "ON") {Menu_General.section(0,{title:"H.I.S (ALARME ON)"});}
                         else {Menu_General.section(0,{title:"H.I.S v.0.4"});}                        
                         console.log('ALARME STATUS : '+alarme_status);                       
                       }, 
    // error
    function(error) {  alarme_status="Error !"; console.log('Erreur acces url ALARME Refresh Status');                     
    }); // AJAX
   

}


function Alarme_Set(alarme_value) {
var url_alarme_off        = http_eedomus_set+'action=periph.value&periph_id=177001&value=0';
var url_alarme_on         = http_eedomus_set+'action=periph.value&periph_id=177001&value=12';
var url_alarme_sirene_off = http_eedomus_set+'action=periph.value&periph_id=168509&value=0';  

var url_alarme            = http_eedomus_set+'action=periph.value&periph_id=174377&value=0';
  
 var Alarme_Ok_Card= new ui.Card({ title: "ALARME", body: alarme_value+" : OK !" });

  
  if (alarme_value=="DESACTIVER" )  { url_alarme=url_alarme_off;            alarme_status="OFF"; }
  if (alarme_value=="ACTIVER"    )  { url_alarme=url_alarme_on;             alarme_status="ON"; }  
  if (alarme_value=="SIRENE OFF" )  { url_alarme=url_alarme_sirene_off;  }  
  
 
  Wait_Card.show();
  ajax( { url: url_alarme, type:'json' }, 
    // success
    function(json) {
  
                        Menu_General.item(0,3, {subtitle: alarme_status});
                        // update menu vmc section
                        Menu_Alarme.section(0,{title:"ALARME : "+alarme_status});

      Wait_Card.hide();      
      Menu_General.show();
      Alarme_Ok_Card.hide();
      Menu_Vmc.hide();
    }, 
    // error
    function(error) {
      Error_Card.show(); Wait_Card.hide();
      setTimeout(function() {Error_Card.hide(); }, 4000); // 4 secondes
      console.log('Erreur set alarme');
    });
}
