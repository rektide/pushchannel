function _init(){
	function _xacListener(evt){
		var xhr= evt.target
		if(xhr.readyState >= 2 && !xhr._xacFired){
			xhr._xacFired= true
			xhr.removeEventListener(_xacListener)
			var xacs= xhr.getResponseHeader("x-associate-content")
			if(xacs)
				xacs= xacs.split(", ")
			else
				return
			for(var x in xacs){
				this.postMessage(xacs[x],"/")
			}
		}
	}
	
	function _XMLHttpRequestXACSend(){
		this.addEventListener("readystatechange",this._xacListener)
		this._xacSendOrig.apply(this,arguments)
	}
	var chan= new MessageChannel()
	chan.port1.start()
	chan.port2.start() // not going anywhere, allow to drop

	XMLHttpRequest.prototype._xacSendOrig= XMLHttpRequest.prototype.send
	XMLHttpRequest.prototype._xacListener= _xacListener.bind(chan.port2)
	XMLHttpRequest.prototype.send= _XMLHttpRequestXACSend

	window.XACPort= chan.port1
}
_init()
