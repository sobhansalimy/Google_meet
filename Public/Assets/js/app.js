var AppProcess = function(){

    function _init(SDP, my_connid){

    }
    var iceConfiguration = {
        iceServers:[
            {
                urls:"stun:stun.l.google.com:19302",
            },
            {
                urls:"stun:stun1.l.google.com:19302"
            },
        ]
    }

    function setNewConnection(connid){
        var connection = new RTCPeerConnection(iceConfiguration);

        connection.onnegotiationneeded = async function(event){
            await setOffer(connid);
        }

        connection.onicecandidate = function(event){
            if(event.candidate){
                serverProcess(JSON.stringify({icecandidate: event.candidate}),
                connid)
            }
        }
    }

    return{
        setNewConnection: async function(connid){
            await setNewConnection(connid);
        },
        init: async function(SDP_function, my_connid){
            await _init(SDP_function, my_connid);
        },
    };
};

var Myapp = (function(){
    var socket = null;
    var user_id = "";
    var meeting_id = "";
    function init(uid, mid){
        user_id = uid;
        meeting_id = mid;
        evemt_process_for_signaling_server();
    }

    function evemt_process_for_signaling_server(){
        socket = io.connect()
        socket.on("connect", ()=>{
            if(socket.connected){
                if(user_id != "" && meeting_id != ""){
                    socket.emit("userconnect", {
                        displayName: user_id,
                        meetingid: meeting_id
                    })
                }
            }

        });

        socket.on("inform_others_about_me", function(data){
            addUser(data.other_user_id, data.connId);
            AppProcess.setNewConnection(data.connId);
        });
    }
    function addUser(other_user_id, connId){
    var newDivId = $("#otherTemplate").clone();
    newDivId = newDivId.attr("id", connId).addClass("other");
    newDivId.find("h2").text(other_user_id); 
    newDivId.find("video").attr("id", "v_" + connId); 
    newDivId.find("audio").attr("id", "a_" + connId); 
    newDivId.show();
    $("#dicUsers").append(newDivId);
    }


    return{
        _init: function(uid,mid){
            init(uid,mid)
        },
    };
})();