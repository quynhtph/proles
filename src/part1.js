/*
* Part1
*/
var CapacityOverview = React.createClass({
	//=====================================================================================================================
	// mixins
	//=====================================================================================================================	
	mixins: [
		ChannelHelperMixin, //componentWillMount, componentWillUnmount
		SettingPopupMixin, //componentWillMount
		InstanceSettingsResolveMixin,
		SettingsBindingMixin
	],

	//=====================================================================================================================
	// Private properties
	//=====================================================================================================================
	functionId: null,
	languageObject: null,
	widgetData: null,
	settings: null,
	previousSettingTabOrder: 0,
	isDefaultSettingsResolved: false,
	classPrefix: 'sib-widget-capacity-overview',
	bind: null,

	//=====================================================================================================================
	// React life cycle functions
	//=====================================================================================================================
	getInitialState: function() {
		return {
			isLoaded: false,
			isSetting: false
		};
	}	
	
});