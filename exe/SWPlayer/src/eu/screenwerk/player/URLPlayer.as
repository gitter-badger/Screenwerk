package eu.screenwerk.player
{
	import flash.events.Event;
	import flash.filesystem.File;
	
	import mx.controls.HTML;
	import mx.core.Application;
	
	public class URLPlayer extends HTML
	{
		
		private var is_playing:Boolean = false;

		public function URLPlayer(id:uint)
		{
			var media_file:File = Application.application.sw_dir.resolvePath(id+'.URL');
			var media_string:String = Application.application.readFileContents(media_file);
			var media_split:Array = media_string.split("\n");
			var url:String = media_split.shift();

			this.location = url;
			
			this.addEventListener(Event.ADDED, _play, false, 0, true);
			this.addEventListener(Event.REMOVED, _stop, false, 0, true);
		}

		private function _play(event:Event):void
		{
			event.stopPropagation();
			this.removeEventListener(Event.ADDED, _play);

			this.x = 0;
			this.y = 0;
			this.width = parent.width;
			this.height = parent.height;
		}
		
		private function _stop(event:Event):void
		{
			event.stopPropagation();
		}

		public function play():void
		{}
	}
}