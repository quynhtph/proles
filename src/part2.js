/*
* Part2
*/
var CapacityOverview = React.createClass({	
  	
  	//=====================================================================================================================
  	// Custom functions
  	//=====================================================================================================================
	initialize: function() {
		var component = this;
		if (component.props.widget.Permission) {
			component.getData().done(function(resp) {
				component.widgetData = resp;

				//Render title
				var title = component.languageObject.chart.title;

				//Render subtitle
				var dateFrom = moment(component.settings.dates.date1, prolesConfiguration.DATE_TIME.YYYYMMDD).format(component.languageObject.chart.titleDateFormatString);
				var dateTo = moment(component.settings.dates.date2, prolesConfiguration.DATE_TIME.YYYYMMDD).format(component.languageObject.chart.titleDateFormatString);
				var subtitle = (_.template(component.languageObject.chart.subtitle))(
					{ dateFrom: dateFrom, dateTo: dateTo }
				);

				$(component.refs.title.getDOMNode()).html(title);
				$(component.refs.subtitle.getDOMNode()).html(subtitle);

				component.setState({
					hasData: component.hasData(component.widgetData)
				}, component.drawCharts);				
				//Init the scrollable root
				var scrollableRoot = $(component.refs.scrollableRoot.getDOMNode());
				if (!scrollableRoot.hasClass('scrollable')) {
					scrollableRoot.scrollable();
				}
			});
		}
	},

	hasData: function(data) {
		return data && data.length !== 0;
	},

	drawCharts: function() {
		var component = this;
		if (component.state.hasData) { //Only render the chart if hasData
			var chartDiv = $(component.refs.chartDiv.getDOMNode());

			var hcInstance = chartDiv.highcharts();
			if (hcInstance) {
				hcInstance.destroy();
				chartDiv.empty();
			}

			var marginTop = 10;
			var marginBottom = 10;

			var tempData = _.clone(component.widgetData);

			// Calculate chart height, 25 for each bar
			var chartHeight = _.reduce(tempData, function(minHeight, emp) { return minHeight += 25; }, marginTop + marginBottom); //marginTop + marginBottom

			//Get the names as category (y-Axis)
			var categories = _.map(tempData, function(emp) { return emp.EmployeeName; });

			//Get the Capacity as value (x-Axis)
			var series = _.map(tempData, function(emp) { return emp.Hour; });

			chartDiv.highcharts({
				chart: {
					type: 'bar',
					marginTop: marginTop,
					marginBottom: marginBottom,
					height: chartHeight
				},
				title: {
					text: null
				},
				credits: {
					enabled: false
				},
				legend: {
					enabled: false
				},
				xAxis: {
					categories: categories
				},
				yAxis: {
					title: {
						text: null
					},
					labels: {
						overflow: 'justify'
					}
				},
				tooltip: {
					valueDecimals: 2,
					valueSuffix: component.languageObject.chart.valueSuffix
				},
				plotOptions: {
					bar: {
						dataLabels: {
							enabled: true,
							formatter: function(format) {
								if (this.y < 0) {
									return '<span style="color: red;">' + this.y.toFixed(2) + '</span>';
								}
								else {
									return this.y.toFixed(2);
								}
							}
						},
						animation: {
							duration: 100
						}
					}
				},
				series: [
					{
						name: component.languageObject.chart.seriesName,
						data: series
					}
				]
			});	
		}
	},

	getLanguageObject: function() {
		return ProlesCapacityOverviewServiceManager.getLanguageObject();
	},

	getJS: function() {
		var deferred = new $.Deferred();

		LazyLoad.js([
	  		'widgets/common/employeeSelector/employeeSelector.js',
	  		'widgets/common/dateRange/dateRange.js'
	  	], function() {
	  		deferred.resolve();
	  	});

		return deferred.promise();
	},

	resolveDefaultSettings: function() {
		var component = this;
		var deferred = new $.Deferred();
		//At first run, no instance setting is available yet. We must
		//transform DefaultSettings into InstanceSetting
		if (!component.isDefaultSettingsResolved) {
			component.getEmployeesForSettings().done(function() {
				component.isDefaultSettingsResolved = true;
				component.updateInstanceSettings().done(function() {
					deferred.resolve();
				});
			});	
		}
		else {
			deferred.resolve();
		}

		return deferred.promise();
	},

	getData: function() {
		var component = this;
		var deferred = new $.Deferred();

		//Resolve relative date here
		var expression = component.settings.dates.expression;
  		if (expression) {
  			component.settings.dates = RelativeDateResolver.resolveDateRange(expression);
  		}

		var date1 = component.settings.dates.date1;
		var date2 = component.settings.dates.date2;
		component.resolveAllEmployees(component.settings.employees).done(function(empIds) { //from settingsResolveMixin
			ProlesCapacityOverviewServiceManager
			.getCapacityOverview(empIds, date1, date2)
			.done(function(resp) {
				deferred.resolve(resp);
			});
		});

		return deferred.promise();
	},

	renderSettingComponents: function() {
		var component = this;
		var settingProgress = new $.Deferred();
		var notifyCollectSettings = new $.Deferred();

		var employeeSettings = (
			<EmployeeSelector 
				user={ component.props.user }
				widget={ component.props.widget }
				widgetTemplate={ component.props.widgetTemplate }
				settings={ component.settings }

				settingProgress={ settingProgress }
				notifyCollectSettings={ notifyCollectSettings }

				bindEmployeeSettings={ component.bindEmployeeSettings } /> //from SettingsBindingMixin
		);

		var dateSettings = (
			<DateRange
				settingProgress={ settingProgress }
				notifyCollectSettings={ notifyCollectSettings }

				bindDateSettings={ component.bindDateRangeSettings } /> //from SettingsBindingMixin
		);

		var widgetSettings = (
			<WidgetSettings
				widget={ component.props.widget }
				innerChannel={ component.innerChannel }
				tabs={[
					{ tabName: 'Employees', tabPane: employeeSettings },
					{ tabName: 'Dates', tabPane: dateSettings }
				]} 

				settingProgress={ settingProgress }
				notifyCollectSettings={ notifyCollectSettings }
				previousSettingTabOrder={ component.previousSettingTabOrder }
				settingsTabClicked={ component.settingsTabClicked } //from SettingsBindingMixin
				bindSettingsCollected={ component.bindSettingsCollected }/> //from SettingsBindingMixin
		);

		return widgetSettings;
	}
});