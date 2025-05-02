// import { useState, useEffect, useContext } from 'react';
// import GridLayout from 'react-grid-layout';
// import { Responsive, WidthProvider } from 'react-grid-layout';
// import ReactApexChart from 'react-apexcharts';
// import { Modal, Button, Form, Input, Select, InputNumber, Typography, Divider, Card, Layout, Space, message, Cascader, Table, Popconfirm, DatePicker } from 'antd';
// import { PlusOutlined, EditOutlined, DeleteOutlined, DragOutlined } from '@ant-design/icons';
// import axios from 'axios';
// import { AuthContext } from '../../context/AuthContext';
// import 'react-grid-layout/css/styles.css';
// import 'react-resizable/css/styles.css';
// import './DashboardVisualization.css';
// import PivotTable from 'react-pivottable/PivotTable';
// import 'react-pivottable/pivottable.css';
// import dayjs from 'dayjs';
// import customParseFormat from 'dayjs/plugin/customParseFormat';
// import utc from 'dayjs/plugin/utc';

// dayjs.extend(customParseFormat);
// dayjs.extend(utc);


// const { Option } = Select;
// const { Title } = Typography;
// const { Header, Content } = Layout;
// const ResponsiveGridLayout = WidthProvider(Responsive);

// const { RangePicker } = DatePicker;

// const DashboardVisualization = () => {
//     const { globalPermissions, token } = useContext(AuthContext);
//     const [databaseTables, setDatabaseTables] = useState([]);
//     const [tableFields, setTableFields] = useState([]);
//     const [loadingFields, setLoadingFields] = useState(false);
//     const [selectedTable, setSelectedTable] = useState(null);
//     const [widgets, setWidgets] = useState([]);

//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [currentWidget, setCurrentWidget] = useState(null);
//     const [isEditMode, setIsEditMode] = useState(false);
//     const [nextId, setNextId] = useState(4);
//     const [form] = Form.useForm();
//     const [selectedTableColumns, setSelectedTableColumns] = useState([]);
//     const [layoutChanged, setLayoutChanged] = useState(false);
//     const [loading, setLoading] = useState(false);
//     const [headers, setHeaders] = useState([]);
//     const [chartData, setChartData] = useState({});
//     const [tableRawData, setTableRawData] = useState([]);
//     const [isDataPopulated, setIsDataPopulated] = useState(false);
//     const [selectedDateRange, setSelectedDateRange] = useState([dayjs().format('YYYY-MM-DD'),
//     dayjs().format('YYYY-MM-DD')]);

//     const chartTypes = [
//         { value: 'pie', label: 'Pie Chart' },
//         { value: 'donut', label: 'Donut Chart' },
//         { value: 'bar', label: 'Bar Chart' },
//         { value: 'line', label: 'Line Chart' },
//         { value: 'area', label: 'Area Chart' },
//         { value: 'NormalTable', label: 'Normal Table' },
//         { value: 'pivot', label: 'Pivot Table' },
//     ];

//     const radarTypes = [
//         { value: 'radar-standard', label: 'Standard Radar Chart' },
//         { value: 'radar-filled', label: 'Filled Radar Chart' },
//         { value: 'radar-polar', label: 'Polar Area Chart' },
//     ];

//     const aggregationOptions = [
//         { value: 'sum', label: 'Sum' },
//         { value: 'stdDev', label: 'Standard Deviation' },
//         { value: 'varPop', label: 'Variance Population' },
//         { value: 'max', label: 'Max' },
//         { value: 'min', label: 'Min' },
//         { value: 'median', label: 'Median' },
//         { value: 'mean', label: 'Mean' },
//         { value: 'distinct', label: 'Distinct' },
//         { value: 'countByValue', label: 'Count by Value' },
//         { value: 'count', label: 'Count' },
//     ];

//     const applyAggregation = (data, aggregationType) => {
//         if (!data || !Array.isArray(data) || data.length === 0 || !aggregationType) {
//             return data || [];
//         }
//         const numericData = data.map(val => parseFloat(val)).filter(val => !isNaN(val));
//         if (numericData.length === 0) {
//             return data;
//         }
//         //console.log('Applying aggregation:', aggregationType, 'on data:', numericData);
//         switch (aggregationType) {
//             case 'sum':
//                 return parseFloat(numericData.reduce((a, b) => a + b, 0).toFixed(2));
//             case 'mean':
//                 return parseFloat((numericData.reduce((a, b) => a + b, 0) / numericData.length).toFixed(2));
//             case 'max':
//                 return parseFloat(Math.max(...numericData).toFixed(2));
//             case 'min':
//                 return parseFloat(Math.min(...numericData).toFixed(2));
//             case 'stdDev': {
//                 const mean = numericData.reduce((a, b) => a + b, 0) / numericData.length;
//                 const variance = numericData.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / numericData.length;
//                 return parseFloat(Math.sqrt(variance).toFixed(2));
//             }
//             case 'varPop': {
//                 const mean = numericData.reduce((a, b) => a + b, 0) / numericData.length;
//                 return parseFloat((numericData.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / numericData.length).toFixed(2));
//             }
//             case 'median': {
//                 const sorted = [...numericData].sort((a, b) => a - b);
//                 const mid = Math.floor(sorted.length / 2);
//                 const median = sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
//                 return parseFloat(median.toFixed(2));
//             }
//             case 'distinct':
//                 return [...new Set(data)];
//             case 'countByValue': {
//                 const counts = {};
//                 data.forEach(val => { counts[val] = (counts[val] || 0) + 1; });
//                 return counts;
//             }
//             case 'count':
//                 return data.length;
//             default:
//                 return data;
//         }
//     };

//     useEffect(() => {
//         const maxId = Math.max(...widgets.map((w) => parseInt(w.i)), -1);
//         setNextId(maxId + 1);
//         fetchDatabaseTables();
//         fetchDashboardWidgets(); // Added to load existing widgets on mount
//     }, [widgets?.length]);




//     useEffect(() => {
//         const fetchDataForWidget = async (widget) => {
//             const { tableId, xColumn, yColumns = [], _id } = widget;
//             if (tableId && xColumn && yColumns.length > 0 && _id) {
//                 const { labels, series } = await fetchChartData(tableId, xColumn, yColumns, _id);
//                 setChartData((prev) => ({
//                     ...prev,
//                     [widget.i]: { labels, series },
//                 }));
//             }
//         };

//         widgets.forEach((widget) => {
//             fetchDataForWidget(widget);
//         });
//     }, [widgets]);



//     const fetchDatabaseTables = async () => {
//         setLoading(true);
//         //console.log('Token being sent:', token);
//         try {
//             const response = await axios.get(`${import.meta.env.VITE_API_URI}/api/data/get-all-tables`, {
//                 headers: { Authorization: `Bearer ${token}` },
//             });

//             if (response?.data?.data) {
//                 setDatabaseTables(response.data.data);
//                 //console.log('Database Tables------,--,-,-,-,-,-,-,:', response.data.data);
//             }
//         } catch (error) {
//             message.error('Failed to load database tables');
//             setDatabaseTables([]);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const fetchDashboardWidgets = async () => {
//         setLoading(true);
//         try {
//             const response = await axios.get(`${import.meta.env.VITE_API_URI}/api/data/dynamic_dashboard`, {
//                 headers: { Authorization: `Bearer ${token}` },
//             });

//             if (!response?.data?.data) {
//                 setWidgets([]);
//                 return;
//             }

//             const fetchedWidgets = Array.isArray(response.data.data)
//                 ? response.data.data
//                 : [response.data.data];

//             const activeWidgets = fetchedWidgets.filter((widget) => !widget.isDeleted);
//             console.log("-------------------", activeWidgets[0].created_at);

//             const formattedWidgets = activeWidgets.map((widget) => ({
//                 _id: widget._id,
//                 i: widget.i?.toString(),
//                 title: widget.title,
//                 yData: widget.yData || [],
//                 type: widget.type,
//                 xAxis: widget.xAxis,
//                 yAxes: Array.isArray(widget.yAxes) ? widget.yAxes : [widget.yAxes],
//                 labels: Array.isArray(widget.labels) ? widget.labels : JSON.parse(widget.labels || '[]'),
//                 data: Array.isArray(widget.data) ? widget.data : [JSON.parse(widget.data || '[]')],
//                 x: widget.x || 0,
//                 y: widget.y || 0,
//                 w: widget.w || 4,
//                 h: widget.h || 3,
//                 tableId: widget.tableId,
//                 xColumn: widget.xColumn,
//                 yColumns: Array.isArray(widget.yColumns) ? widget.yColumns : [widget.yColumns],
//                 aggregations: widget.aggregations || [],
//                 created_at: widget.created_at,
//                 updated_at: widget.updated_at
//             }));


//             // Filter widgets based on selected date range
//             const filteredWidgets = selectedDateRange.length === 2
//                 ? formattedWidgets.filter(widget => {
//                     if (!widget.created_at) return false;

//                     // Parse the widget date from the format it's stored in
//                     const widgetDate = dayjs(widget.created_at, "DD-MM-YYYY HH:mm:ss").format('YYYY-MM-DD');
//                     const startDate = dayjs(selectedDateRange[0]).format('YYYY-MM-DD');
//                     const endDate = dayjs(selectedDateRange[1]).format('YYYY-MM-DD');

//                     // Compare dates in YYYY-MM-DD format
//                     return widgetDate >= startDate && widgetDate <= endDate;
//                 })
//                 : formattedWidgets;

//             if (selectedDateRange.length === 2 && filteredWidgets.length === 0) {
//                 message.info('No charts available for the selected date range');
//             }



//             setWidgets(filteredWidgets);
//             const maxId = Math.max(...filteredWidgets.map(w => parseInt(w.i) || 0), -1);
//             setNextId(maxId + 1);
//         } catch (error) {
//             console.error('Error fetching widgets:', error);
//             message.error('Failed to load dashboard widgets');
//             setWidgets([]);
//         } finally {
//             setLoading(false);
//         }
//     };
//     // Add useEffect to refetch widgets when date range changes
//     useEffect(() => {
//         fetchDashboardWidgets();
//     }, [selectedDateRange]);

//     const fetchTableFields = async (tableName) => {
//         setLoadingFields(true);
//         try {
//             const response = await axios.get(`${import.meta.env.VITE_API_URI}/api/data/${tableName}`, {
//                 headers: { Authorization: `Bearer ${token}` },
//             });

//             //console.log(`API Response for ${tableName}:`, response.data);

//             let allFieldNames = [];
//             if (response.data.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
//                 const responseData = response.data.data;
//                 setTableRawData(responseData);
//                 //console.log("responseData----->>>>", responseData);


//                 const uniqueFields = new Set();
//                 responseData.forEach((row) => {
//                     Object.keys(row).forEach((key) => uniqueFields.add(key));
//                 });
//                 allFieldNames = Array.from(uniqueFields);
//                 setHeaders(allFieldNames);
//             } else {
//                 setTableRawData([]);
//             }

//             if (response.data.fields && Array.isArray(response.data.fields)) {
//                 allFieldNames = response.data.fields.map((field) => field.name);
//                 setTableFields(response.data.fields);
//             } else {
//                 setTableFields(allFieldNames.map((name) => ({ name })));
//             }

//             setSelectedTableColumns(allFieldNames);
//             //console.log('Updated headers:', allFieldNames);
//         } catch (error) {
//             console.error('Error fetching table fields:', error);
//             message.error('Failed to load table fields');
//             setTableFields([]);
//             setTableRawData([]);
//             setHeaders([]);
//             setSelectedTableColumns([]);
//         } finally {
//             setLoadingFields(false);
//         }
//     };

//     const handleLayoutChange = (layout) => {
//         setWidgets(widgets.map((widget) => {
//             const layoutItem = layout.find((item) => item.i === widget.i);
//             return layoutItem ? { ...widget, x: layoutItem.x, y: layoutItem.y, w: layoutItem.w, h: layoutItem.h } : widget;
//         }));
//         setLayoutChanged(true);
//     };


//     const openAddModal = async () => {

//         form.resetFields();

//         await fetchDatabaseTables();

//         const defaultTable = databaseTables.length > 0 ? databaseTables[0] : null;
//         let defaultFields = [];
//         let defaultData = [];
//         let defaultLabels = [];

//         if (defaultTable) {
//             await fetchTableFields(defaultTable);
//             defaultFields = selectedTableColumns.length > 0 ? selectedTableColumns : ['X Axis', 'Y Axis'];
//             //console.log("defaultFields------>", defaultFields);

//             defaultLabels = tableRawData.length > 0 ? tableRawData.slice(0, 3).map((row) => row[defaultFields[0]] || 'Label') : ['Label 1', 'Label 2', 'Label 3'];
//             defaultData = tableRawData.length > 0 ? [tableRawData.slice(0, 3).map((row) => row[defaultFields[1]] || 0)] : [[10, 20, 30]];
//         } else {
//             defaultFields = ['X Axis', 'Y Axis'];
//             defaultLabels = ['Label 1', 'Label 2', 'Label 3'];
//             defaultData = [[10, 20, 30]];
//         }

//         const newWidget = {
//             i: nextId.toString(),
//             type: '', // Default type, can be changed dynamically via form
//             x: 0,
//             y: 0,
//             w: 3,
//             h: 3,
//             title: ' ',
//             xAxis: defaultFields[0], // Use first field as X-axis
//             yAxes: defaultFields[1], // Use second field as Y-axis
//             labels: defaultLabels, // Dynamic labels from table data
//             data: defaultData, // Dynamic data from table
//             tableId: defaultTable, // Default table name
//             xColumn: defaultFields[0], // Default X column
//             yColumns: defaultFields[1], // Ensure yColumns is set
//             aggregations: [], // Default aggregation

//         };

//         //console.log('New Widget Configuration:', newWidget); // Log the new widget
//         setCurrentWidget(newWidget);
//         setIsEditMode(false);
//         setIsModalOpen(true);
//         //setSelectedTableColumns(defaultFields);


//     };




//     const openEditModal = (widget) => {
//         //console.log('Editing widget:', widget);
//         setCurrentWidget({ ...widget });
//         setIsEditMode(true);
//         setIsModalOpen(true);
//         if (widget.tableId) {
//             fetchTableFields(widget.tableId);
//             //console.log("tableId", widget.tableId);
//         } else {
//             setSelectedTableColumns([]);
//             //console.log("tableId---------->>>>>----", setSelectedTableColumns);

//         }

//         const yColumnValues = Array.isArray(widget.yColumns) ? widget.yColumns.map(col => [widget.tableId, col]) : []; //console.log("Formatted yColumns for form:", yColumnValues);
//         // console.log("datas>>>>>>>>>>", widget.title,widget.type,widget.xAxis,widget.yAxes,widget.data,widget.aggregations,widget.labels,widget.w,widget.h,widget.tableId,widget.xColumn,widget.yColumns);
//         // console.log("yData>>>>>>>>>>", yData);
//         console.log("widget.aggregations>>>>>>>>>>", widget.aggregations);
//         console.log("widget.yData>>>>>>>>>>", widget.yData);
//         form.setFieldsValue({
//             title: widget.title,
//             type: widget.type,
//             xAxis: widget.xAxis,
//             yData: widget.yData,
//             labels: widget.labels.join(', '),
//             w: widget.w,
//             h: widget.h,
//             tableAndFields: widget.tableId && widget.xColumn ? [widget.tableId, widget.xColumn] : undefined,
//             yColumns: yColumnValues // Ensure yColumns is set
//         });



//     };




//     const closeModal = () => {
//         setIsModalOpen(false);
//         setCurrentWidget(widgets.find((w) => w.i === currentWidget.i));

//     };



//     const handleWidgetDelete = async (widgetId) => {
//         try {
//             setLoading(true);
//             const widgetToDelete = widgets.find((w) => w._id === widgetId);

//             if (!widgetToDelete) {
//                 console.error('Widget not found in state for ID:', widgetId);
//                 message.error('Widget not found');
//                 return;
//             }

//             if (widgetToDelete._id) {
//                 const response = await axios.delete(
//                     `${import.meta.env.VITE_API_URI}/api/data/dynamic_dashboard/${widgetToDelete._id}`,
//                     {
//                         headers: { Authorization: `Bearer ${token}` },
//                     }
//                 );

//                 setWidgets((prevWidgets) => {
//                     const updatedWidgets = prevWidgets.filter((w) => w._id !== widgetId);
//                     return updatedWidgets;
//                 });

//                 message.success('Widget deleted successfully');
//                 await fetchDashboardWidgets(); // Refresh UI
//             } else {
//                 console.warn('No _id found for widget:', widgetId);
//                 setWidgets((prevWidgets) => prevWidgets.filter((w) => w._id !== widgetId));
//                 message.warning('Widget removed locally (no database ID)');
//             }
//         } catch (error) {
//             console.error('Error deleting widget:', {
//                 message: error.message,
//                 response: error.response?.data,
//                 status: error.response?.status,
//             });
//             message.error(`Failed to delete widget: ${error.response?.data?.message || error.message}`);
//         } finally {
//             setLoading(false);
//             setLayoutChanged(true);
//         }
//     };
//     const updateXLabels = (xField) => {
//         if (!tableRawData || !Array.isArray(tableRawData) || tableRawData.length === 0 || !xField) {
//             form.setFieldsValue({ labels: '', xAxis: xField || 'X Axis' });
//             setIsDataPopulated(false);
//             return;
//         }

//         try {
//             const uniqueLabels = Array.from(
//                 new Set(tableRawData.map((item) => String(item[xField] || '')))
//             ).filter((label) => label !== '');
//             //console.log("table Raw", tableRawData);


//             if (uniqueLabels.every(label => !isNaN(Number(label)))) {
//                 uniqueLabels.sort((a, b) => Number(a) - Number(b));
//             }

//             form.setFieldsValue({ labels: uniqueLabels.join(', '), xAxis: xField });
//             setIsDataPopulated(true);
//         } catch (error) {
//             console.error('Error updating X labels:', error);
//             message.error('Failed to update chart labels');
//             setIsDataPopulated(false);
//         }
//     };




//     const updateYValues = (yField, index) => {
//         if (!tableRawData || !Array.isArray(tableRawData) || tableRawData.length === 0 || !yField) {
//             const yData = form.getFieldValue('yData') || [];
//             yData[index] = { ...yData[index], data: '', yAxes: yField || 'Y Axis' };
//             form.setFieldsValue({ yData });
//             setIsDataPopulated(false);


//             return;
//         }

//         try {
//             const allValues = tableRawData
//                 .map((item) => parseFloat(item[yField] || 0).toFixed(2))
//                 .filter((value) => value !== '0.00');
//             const yData = form.getFieldValue('yData') || [];
//             //console.log(")))))))))))))))))))))", yData[0].yAxes, yData);
//             yData[index] = { ...yData[index], data: allValues.join(', '), yAxes: yField };
//             form.setFieldsValue({ yData });
//             setIsDataPopulated(true);
//         } catch (error) {
//             console.error('Error updating Y values:', error);
//             message.error('Failed to update chart values');
//             setIsDataPopulated(false);
//         }
//     };



//     const handleFormSubmit = async (values) => {
//         try {
//             setLoading(true);

//             const { tableAndFields, type, title, w, h, yData } = values;
//             const tableId = tableAndFields[0];
//             const xColumn = tableAndFields[1];
//             const yCols = yData.map((item) => item.yColumns?.[1]).filter(Boolean);

//             // Ensure aggregations are properly formatted
//             const aggregations = yData.map((item) => item.aggregation || null);

//             const widgetData = {
//                 i: isEditMode ? currentWidget.i : nextId.toString(),
//                 title,
//                 type,
//                 yData,
//                 xAxis: xColumn,
//                 yAxes: yCols,
//                 x: isEditMode ? currentWidget.x : 0,
//                 y: isEditMode ? currentWidget.y : 0,
//                 w,
//                 h,
//                 tableId,
//                 xColumn,
//                 yColumns: yCols,
//                 aggregations,  // Store aggregations as an array
//                 created_at: isEditMode ? currentWidget.created_at : new Date().toISOString(),
//                 updated_at: new Date().toISOString(),
//             };

//             if (isEditMode) {
//                 const response = await axios.put(
//                     `${import.meta.env.VITE_API_URI}/api/data/dynamic_dashboard/${currentWidget._id}`,
//                     widgetData,
//                     { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
//                 );

//                 // Update only the specific widget in state
//                 setWidgets(prevWidgets =>
//                     prevWidgets.map(widget =>
//                         widget._id === currentWidget._id
//                             ? { ...widgetData, _id: currentWidget._id }
//                             : widget
//                     )
//                 );
//             } else {
//                 const response = await axios.post(
//                     `${import.meta.env.VITE_API_URI}/api/data/dynamic_dashboard`,
//                     widgetData,
//                     { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
//                 );

//                 const newWidget = {
//                     ...widgetData,
//                     _id: response.data._id || response.data.insertedId,
//                 };

//                 setWidgets(prevWidgets => [...prevWidgets, newWidget]);
//                 setNextId(prev => prev + 1);
//             }

//             message.success(`Widget ${isEditMode ? 'updated' : 'added'} successfully`);
//             closeModal();
//         } catch (error) {
//             console.error(`Error ${isEditMode ? 'updating' : 'adding'} widget:`, error);
//             message.error(`Failed to ${isEditMode ? 'update' : 'add'} widget: ${error.message}`);
//         } finally {
//             setLoading(false);
//         }
//     };


//     const getChartOptions = (widget, labels) => {
//         const baseOptions = {
//             chart: {
//                 id: `chart-${widget.i}`,
//                 toolbar: { show: true },
//                 type: widget.type,
//             },
//             tooltip: { enabled: true },

//         };

//         if (widget.type === 'pie' || widget.type === 'donut') {
//             return {
//                 ...baseOptions,
//                 labels: labels,
//                 legend: { position: 'bottom' },
//                 chart: {
//                     ...baseOptions.chart,
//                     type: widget.type === 'donut' ? 'donut' : 'pie',
//                 },
//                 plotOptions: {
//                     pie: {
//                         donut: {
//                             size: '55%',
//                             customScale: 0.8,
//                         },
//                     },
//                 },
//             };
//         } else if (widget.type.startsWith('radar')) {
//             const radarType = widget.type.split('-')[1] || 'standard';
//             const isPolar = radarType === 'polar';

//             return {
//                 ...baseOptions,
//                 chart: {
//                     ...baseOptions.chart,
//                     type: 'radar',
//                 },
//                 xaxis: {
//                     categories: widget.labels,
                    
//                 },
//                 yaxis: widget.yAxes.map((title, idx) => ({
//                     title: { text: `${title}${widget.aggregations[idx] ? ` (${widget.aggregations[idx]})` : ''}` },
//                     opposite: idx % 2 === 1,
//                 })),
//                 fill: {
//                     opacity: isPolar || radarType === 'filled' ? 0.8 : 0,
//                     colors: isPolar || radarType === 'filled' ? ['#FF9800'] : undefined,
//                 },
//                 stroke: {
//                     show: !isPolar,
//                     width: radarType === 'filled' ? 0 : 2,
//                     colors: radarType === 'standard' ? ['#F44336'] : undefined,
//                 },
//                 markers: {
//                     size: radarType === 'standard' ? 4 : 0,
//                     colors: ['#F44336'],
//                 },
//                 plotOptions: {
//                     radar: {
//                         polygons: {
//                             strokeColors: '#e8e8e8',
//                             fill: {
//                                 colors: isPolar
//                                     ? widget.data.map((_, i) => `rgba(${55 + i * 40}, ${150 - i * 20}, 251, 0.85)`)
//                                     : ['#f8f8f8'],
//                             },
//                         },
//                     },
//                 },
//             };
//         } else {
//             const chartSpecificOptions = {
//                 bar: {
//                     plotOptions: {
//                         bar: {
//                             endingShape: 'rounded',
//                         },
//                         states: {
//                             hover: {
//                                 filter: {
//                                     type: 'none',
//                                 },
//                             },
//                         },
//                         grid: {
//                             padding: {
//                                 left: 0,
//                                 right: 0,
//                             },
//                         },
//                     },

//                     dataLabels: {
//                         enabled: true,  // Enable data labels by default
//                         formatter: function (val, opt) {
//                             // Check if aggregations are applied
//                             const seriesIndex = opt.seriesIndex;
//                             const widget = opt.w.config.widget; // You'll need to pass the widget in chart options

//                             // Show data labels only if aggregations exist for this series
//                             if (widget && widget.aggregations && widget.aggregations[seriesIndex]) {
//                                 return val.toFixed(2);  // Format the number to 2 decimal places
//                             }
//                             return '';  // Return empty string to hide label if no aggregation
//                         },
//                         style: {
//                             fontSize: '12px',
//                             fontFamily: 'Arial',
//                         },
//                         offsetY: -10,  // Adjust label position above the bars
//                     },
//                 },
//                 line: {
//                     stroke: {
//                         width: 4,
//                         curve: 'smooth',
//                         lineCap: 'round',
//                     },
//                     markers: {
//                         size: 5,
//                         strokeWidth: 2,
//                         hover: {
//                             size: 8,
//                         },
//                     },
//                     dataLabels: {
//                         enabled: true, // Enable data labels by default
//                     },
//                 },
//                 area: {
//                     fill: {
//                         type: 'gradient',
//                         gradient: {
//                             shadeIntensity: 1,
//                             opacityFrom: 0.9,
//                             opacityTo: 0.6,
//                         },
//                     },
//                 },

//             };

//             const specificOptions = chartSpecificOptions[widget.type] || {};

//             return {
//                 ...baseOptions,
//                 ...specificOptions,
//                 chart: {
//                     ...baseOptions.chart,
//                     type: widget.type,
//                 },
//                 xaxis: {
//                     categories: widget.labels,
//                     label: {
//                         text: widget.xAxis || 'X-Axis',  // Display widget.xAxis as the X-axis title
//                         style: {
//                             fontSize: '14px',
//                             fontWeight: 'bold',
//                             fontFamily: 'Arial'
//                         },
//                         offsetY: 10 // Adjust this value to position the title above the categories
//                     },
//                     axisBorder: {
//                         show: true
//                     },
//                     axisTicks: {
//                         show: true
//                     },


//                 },
//                 yaxis: widget.yAxes.map((title, idx) => ({
//                     title: {
//                         text: `${title}${widget.aggregations[idx] ? ` (${widget.aggregations[idx]})` : ''}`,
//                         style: {
//                             fontSize: '14px',
//                             fontWeight: 'bold',
//                         }
//                     },
//                     opposite: idx % 2 === 1,
//                 })),
//             };
//         }
//     };

//     const fetchChartData = async (tableId, xColumn, yColumns, widgetId) => {
//         try {
//             const response = await axios.get(`${import.meta.env.VITE_API_URI}/api/data/${tableId}`, {
//                 headers: { Authorization: `Bearer ${token}` },
//             });

//             if (response.data.data) {
//                 // Get unique x-axis values
//                 const uniqueLabels = [...new Set(response.data.data.map(row => row[xColumn] || ''))];

//                 // Find the specific widget using its unique ID
//                 const currentWidget = widgets.find(w => w._id === widgetId);

//                 if (!currentWidget) {
//                     console.error('Widget not found:', widgetId);
//                     return { labels: [], series: [] };
//                 }

//                 const series = yColumns.map((yCol, index) => {
//                     // Group data by x-axis values
//                     const groupedData = uniqueLabels.map(label => {
//                         const groupValues = response.data.data
//                             .filter(row => row[xColumn] === label)
//                             .map(row => parseFloat(row[yCol]) || 0);

//                         // Use aggregation only from the current widget
//                         const aggregationType = currentWidget.aggregations?.[index];

//                         if (aggregationType) {
//                             return applyAggregation(groupValues, aggregationType);
//                         }
//                         return groupValues; // Return all values if no aggregation
//                     });

//                     // Check if aggregation is applied
//                     const aggregationType = currentWidget.aggregations?.[index];

//                     if (!aggregationType) {
//                         // If no aggregation, create multiple series for each value
//                         const maxValues = Math.max(...groupedData.map(group =>
//                             Array.isArray(group) ? group.length : 1
//                         ));

//                         // Create series for each value
//                         const multipleSeries = [];
//                         for (let i = 0; i < maxValues; i++) {
//                             multipleSeries.push({
//                                 name: `${yCol} (${i + 1})`,
//                                 data: uniqueLabels.map((_, labelIndex) => {
//                                     const values = groupedData[labelIndex];
//                                     return Array.isArray(values) && values[i] !== undefined
//                                         ? values[i]
//                                         : null;
//                                 })
//                             });
//                         }
//                         return multipleSeries;
//                     }

//                     // If aggregation is selected, return single series
//                     return {
//                         name: `${yCol} ${aggregationType ? `(${aggregationOptions.find(opt => opt.value === aggregationType)?.label})` : ''}`,
//                         data: groupedData
//                     };
//                 });

//                 // Flatten the series array
//                 const flattenedSeries = series.flat();

//                 return {
//                     labels: uniqueLabels,
//                     series: flattenedSeries
//                 };
//             }

//             return { labels: [], series: [] };
//         } catch (error) {
//             console.error('Error fetching chart data:', error);
//             message.error('Failed to fetch chart data');
//             return { labels: [], series: [] };
//         }
//     };


//     const renderNormalTable = (widget, data) => {
//         if (!data || !data.series || !data.labels) return null;

//         // Transform the data into a format suitable for pivot table
//         const normalTableData = data.labels.map((label, index) => {
//             const row = { xAxis: label };
//             data.series.forEach(series => {
//                 row[series.name] = series.data[index];
//             });
//             return row;
//         });

//         // Create columns configuration
//         const columns = [
//             {
//                 title: widget.xAxis || 'Category',
//                 dataIndex: 'xAxis',
//                 key: 'xAxis',
//                 fixed: 'left',
//             },
//             ...data.series.map(series => ({
//                 title: series.name,
//                 dataIndex: series.name,
//                 key: series.name,
//                 sorter: (a, b) => (a[series.name] || 0) - (b[series.name] || 0),
//                 render: (value) => typeof value === 'number' ? value.toFixed(2) : value,
//             }))
//         ];

//         return (
//             <Table
//                 dataSource={normalTableData}
//                 columns={columns}
//                 scroll={{ x: true }}
//                 pagination={false}
//                 size="small"
//                 bordered
//                 style={{ height: '100%', overflow: 'auto' }}
//             />
//         );
//     };

//     const renderPivot = (widget, data) => {
//         if (!data || !data.series || !data.labels) return null;

//         // Transform the data into a format suitable for the pivot table
//         const pivotData = data.labels.flatMap((label, index) => {
//             return data.series.map(series => ({
//                 [widget.xAxis]: label,
//                 'Measure': series.name,
//                 'Value': parseFloat(series.data[index]) || 0
//             }));
//         });

//         // Map your aggregation types to PivotTable.js aggregation names
//         const getAggregatorName = (aggregationType) => {
//             switch (aggregationType) {
//                 case 'sum':
//                     return 'Sum';
//                 case 'mean':
//                     return 'Average';
//                 case 'count':
//                     return 'Count';
//                 case 'min':
//                     return 'Minimum';
//                 case 'max':
//                     return 'Maximum';
//                 case 'countByValue':
//                     return 'Count Unique Values';
//                 default:
//                     return 'Sum'; // Default aggregation
//             }
//         };

//         // Get the first aggregation from widget's aggregations array
//         const selectedAggregation = widget.aggregations?.[0] || 'sum';
//         const aggregatorName = getAggregatorName(selectedAggregation);
//         const aggregatedData = pivotData.map(item => {
//             const value = item['Value'];
//             const aggregatedValue = applyAggregation([value], selectedAggregation);
//             return {
//                 ...item,
//                 'Value': aggregatedValue
//             };
//         });
//         return (
//             <div style={{ height: '100%', overflow: 'auto' }}>
//                 <PivotTable
//                     data={aggregatedData}
//                     rows={[widget.xAxis]}
//                     cols={['Measure']}
//                     vals={['Value']}
//                     aggregatorName={aggregatorName}
//                     rendererName="Table"
//                     sorters={{
//                         Value: (a, b) => parseFloat(a) - parseFloat(b)
//                     }}
//                     unusedOrientationCutoff={Infinity}
//                 />
//             </div>
//         );
//     };

//     const renderChart = (widget) => {
//         const { labels, series } = chartData[widget.i] || { labels: [], series: [] };
//         const options = {
//             ...getChartOptions(widget, labels),
//             widget: widget
//         };

//         let chartSeries;

//         // For pivot table and normal table, return them directly without the xAxis text
//         if (widget.type === 'pivot') {
//             return renderPivot(widget, { labels, series });
//         }
//         if (widget.type === 'NormalTable') {
//             return renderNormalTable(widget, { labels, series });
//         }

//         // Handle other chart types
//         if (widget.type === 'pie' || widget.type === 'donut') {
//             if (Array.isArray(series) && series.length > 0) {
//                 chartSeries = series[0]?.data?.map((val) => Number(val) || 0) || [];
//             } else {
//                 chartSeries = [];
//             }
//         } else {
//             chartSeries = series.map((s, idx) => ({
//                 name: s.name,
//                 data: s.data.map((val) =>
//                     val === null ? null : parseFloat((parseFloat(val) || 0).toFixed(2))
//                 ),
//             }));
//         }

//         // Return wrapper with xAxis text only for chart types
//         return (
//             <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                
//                 <div style={{ flex: 1 }}>
//                     <ReactApexChart
//                         options={{
//                             ...options,
//                             xaxis: { categories: labels },


//                             tooltip: {
//                                 shared: true,
//                                 intersect: false,
//                             },

//                             chart: {
//                                 ...options.chart,
//                                 animations: {
//                                     enabled: true,
//                                 },
//                                 dropShadow: {
//                                     enabled: true,
//                                     blur: 3,
//                                     opacity: 0.2,
//                                 },
//                             },

//                         }}

//                         series={chartSeries}
//                         type={widget.type.startsWith('radar') ? 'radar' : widget.type}
//                         height="95%"
//                     />
//                 </div>

//                 <div style={{
//                     textAlign: 'center',
//                     padding: '6px',

//                     fontWeight: 'bold',
//                     fontSize: '14px'
//                 }}>
//                     {widget.xAxis}
//                 </div >
//             </div >
//         );
       
       
//     };

//     return (
//         <Layout className="dashboard-layout">
//             <Header className="dashboard-header">
//                 <Title level={3} style={{ color: 'white', margin: 0 }}>
//                     Dashboard Visualization
//                 </Title>
//                 <Space>
//                     <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal}>
//                         Add Widget
//                     </Button>

//                 </Space>

//             </Header>
//             <div style={{ marginBottom: '16px', textAlign: 'right', padding: '20px 24px' }}>
//                 <RangePicker
//                     defaultValue={[dayjs(), dayjs()]}
//                     value={selectedDateRange.length === 2 ? [
//                         dayjs(selectedDateRange[0]),
//                         dayjs(selectedDateRange[1])
//                     ] : null}
//                     onChange={(dates, dateStrings) => {
//                         // If dates is null (when user clears the selection) or dateStrings are empty
//                         if (!dates || dateStrings.every(date => date === '')) {
//                             setSelectedDateRange([]); // Set to empty array to show all widgets
//                         } else {
//                             // setSelectedDateRange(dateStrings);
//                             setSelectedDateRange(dateStrings.map(date =>
//                                 dayjs(date, 'DD-MM-YYYY').format('YYYY-MM-DD')
//                             ));
//                         }
//                         console.log('Selected Date Range:>>>.-----', dateStrings);
//                     }}
//                     style={{ width: '250px' }}
//                     placeholder={['Start Date', 'End Date']}
//                     format="DD-MM-YYYY"
//                     allowClear={true}
//                 />
//             </div>

//             <Content className="dashboard-content">
//                 <ResponsiveGridLayout
//                     className="layout"
//                     layouts={{
//                         lg: widgets.map(widget => ({
//                             ...widget,
//                             i: widget.i,
//                             x: widget.x || 0,
//                             y: widget.y || 0,
//                             w: widget.w || 4,
//                             h: widget.h || 3,
//                         })),
//                         md: widgets.map(widget => ({
//                             ...widget,
//                             i: widget.i,
//                             x: widget.x || 0,
//                             y: widget.y || 0,
//                             w: Math.min(widget.w || 4, 6), // Limit width on medium screens
//                             h: widget.h || 3,
//                         })),
//                         sm: widgets.map(widget => ({
//                             ...widget,
//                             i: widget.i,
//                             x: 0, // Force single column
//                             y: widget.y || 0,
//                             w: 12, // Full width on small screens
//                             h: widget.h || 3,
//                         })),
//                         xs: widgets.map(widget => ({
//                             ...widget,
//                             i: widget.i,
//                             x: 0, // Force single column
//                             y: widget.y || 0,
//                             w: 12, // Full width on extra small screens
//                             h: widget.h || 3,
//                         })),
//                     }}
//                     breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
//                     cols={{ lg: 12, md: 6, sm: 12, xs: 12 }}
//                     rowHeight={100}
//                     margin={[10, 10]}
//                     containerPadding={[15, 15]}
//                     onLayoutChange={handleLayoutChange}
//                     draggableHandle=".drag-handle"
//                     isResizable={true}
//                     isDraggable={true}
//                     style={{ minHeight: '100vh' }}
//                 >
//                     {widgets.map((widget) => (
//                         <div
//                             key={widget.i}
//                             className="widget-container"
//                         >
//                             <Card
//                                 title={
//                                     <div className="drag-handle">
//                                         <DragOutlined className="drag-icon" /> {widget.title}
//                                     </div>
//                                 }
//                                 extra={
//                                     <Space>
//                                         <Button
//                                             type="text"
//                                             icon={<EditOutlined />}
//                                             onClick={() => openEditModal(widget)}
//                                             className="edit-button"
//                                         />
//                                         <Popconfirm
//                                             title="Are you sure you want to delete this widget?"
//                                             description="This action cannot be undone."
//                                             onConfirm={() => handleWidgetDelete(widget._id)}
//                                             onCancel={() => { }}
//                                             okText="Yes"
//                                             cancelText="No"
//                                             placement="topRight"
//                                         >
//                                             <Button
//                                                 type="text"
//                                                 icon={<DeleteOutlined />}
//                                                 className="delete-button"
//                                             />
//                                         </Popconfirm>
//                                     </Space>
//                                 }
//                                 bordered={true}
//                                 className="widget-card"
//                                 style={{ height: '100%' }}
//                             >
//                                 <div className="widget-content">
//                                     {chartData[widget.i] ? (
//                                         renderChart(widget)
//                                     ) : (
//                                         <Typography.Text type="secondary">Loading chart data...</Typography.Text>
//                                     )}
//                                 </div>
//                                 {widget.tableId && (
//                                     <div className="widget-data-source">
//                                         <Typography.Text type="secondary">
//                                             Data source: {widget.tableId} ({widget.xColumn} → {widget.yColumns.join(', ')})
//                                             {widget.aggregations.some((agg) => agg) ? ` [${widget.aggregations.filter((agg) => agg).join(', ')}]` : ''}
//                                         </Typography.Text>
//                                     </div>
//                                 )}
//                             </Card>
//                         </div>
//                     ))}
//                 </ResponsiveGridLayout>


//                 <Modal
//                     title={isEditMode ? 'Edit Widget' : 'Add New Widget'}
//                     open={isModalOpen}
//                     onCancel={closeModal}
//                     footer={null}
//                     width={700}
//                     confirmLoading={loading}
//                 >
//                     <Form
//                         form={form}
//                         layout="vertical"
//                         onFinish={handleFormSubmit}
//                     >
//                         <Form.Item
//                             name="title"
//                             label="Widget Title"
//                             rules={[{ required: true, message: 'Please enter a widget title' }]}
//                         >
//                             <Input placeholder="Enter widget title" />
//                         </Form.Item>

//                         <Form.Item
//                             name="type"
//                             label="Chart Type"
//                             rules={[{ required: true, message: 'Please select a chart type' }]}
//                         >
//                             <Select placeholder="Select chart type">
//                                 {chartTypes.map((type) => (
//                                     <Option key={type.value} value={type.value}>
//                                         {type.label}
//                                     </Option>
//                                 ))}
//                                 <Select.OptGroup label="Radar Charts">
//                                     {radarTypes.map((type) => (
//                                         <Option key={type.value} value={type.value}>
//                                             {type.label}
//                                         </Option>
//                                     ))}
//                                 </Select.OptGroup>
//                             </Select>
//                         </Form.Item>

//                         <Divider>Data Source</Divider>
//                         <Form.Item name="tableAndFields" label="X Axis">
//                             <Cascader
//                                 options={databaseTables.map((table) => ({
//                                     value: table,
//                                     label: table,
//                                     children: (headers || []).map((header) => ({ value: header, label: header })),
//                                 }))}
//                                 placeholder="Select table → X field"
//                                 onChange={(value) => {
//                                     if (value && value.length > 0) {
//                                         const tableName = value[0];
//                                         setSelectedTable(tableName);
//                                         fetchTableFields(tableName);
//                                         if (value.length === 2) updateXLabels(value[1]);
//                                     }
//                                     console.log(value);
//                                 }}

//                                 loadData={async (selectedOptions) => {
//                                     const targetOption = selectedOptions[0];
//                                     targetOption.loading = true;
//                                     await fetchTableFields(targetOption.value);
//                                     targetOption.loading = false;
//                                     targetOption.children = headers.map((header) => ({
//                                         value: header,
//                                         label: header,
//                                     }));
//                                     targetOption.loading = false;
//                                     setDatabaseTables([...databaseTables]);
//                                 }}

//                             />
//                         </Form.Item>


//                         <Form.List name="yData">
//                             {(fields, { add, remove }) => (
//                                 <>
//                                     {fields.map(({ key, name, ...restField }, index) => (
//                                         <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
//                                             <Form.Item
//                                                 {...restField}
//                                                 name={[name, 'aggregation']}
//                                                 label={`Aggregation ${index + 1}`}
//                                             >
//                                                 <Select placeholder="Select aggregation method" allowClear>
//                                                     {aggregationOptions.map((option) => (
//                                                         <Option key={option.value} value={option.value}>
//                                                             {option.label}
//                                                         </Option>
//                                                     ))}
//                                                 </Select>
//                                             </Form.Item>
//                                             <Form.Item
//                                                 {...restField}
//                                                 name={[name, 'yColumns']}
//                                                 label={`Y Axis Field ${index + 1}`}
//                                             >
//                                                 <Cascader
//                                                     options={databaseTables.map((table) => ({
//                                                         value: table,
//                                                         label: table,
//                                                         children: (headers || []).map((header) => ({ value: header, label: header })),
//                                                     }))}
//                                                     placeholder="Select table → Y field"
//                                                     onChange={(value) => {
//                                                         if (value && value.length > 0) {
//                                                             const tableName = value[0];
//                                                             setSelectedTable(tableName);
//                                                             fetchTableFields(tableName);
//                                                             if (value.length === 2) updateYValues(value[1]);
//                                                         }
//                                                         console.log("Selected Value....", value);
//                                                     }}

//                                                     loadData={async (selectedOptions) => {
//                                                         const targetOption = selectedOptions[0];
//                                                         targetOption.loading = true;
//                                                         await fetchTableFields(targetOption.value);
//                                                         targetOption.loading = false;
//                                                         targetOption.children = headers.map((header) => ({
//                                                             value: header,
//                                                             label: header,
//                                                         }));
//                                                         targetOption.loading = false;
//                                                         setDatabaseTables([...databaseTables]);
//                                                         // console.log("value-------->", value);
//                                                     }}


//                                                 />
//                                             </Form.Item>
//                                             {fields.length > 1 && (
//                                                 <Button onClick={() => remove(name)}>Remove</Button>
//                                             )}
//                                         </Space>
//                                     ))}
//                                     <Form.Item>
//                                         <Button
//                                             type="dashed"
//                                             onClick={() => add()}
//                                             block
//                                             icon={<PlusOutlined />}
//                                         >
//                                             Add Y Axis
//                                         </Button>
//                                     </Form.Item>
//                                 </>
//                             )}
//                         </Form.List>



//                         <Divider>Widget Size</Divider>
//                         <div style={{ display: 'flex', gap: '16px' }}>
//                             <Form.Item
//                                 name="w"
//                                 label="Width (columns)"
//                                 rules={[{ required: true, message: 'Please enter width' }]}
//                                 style={{ flex: 1 }}
//                             >
//                                 <InputNumber min={1} max={12} style={{ width: '100%' }} />
//                             </Form.Item>
//                             <Form.Item
//                                 name="h"
//                                 label="Height (rows)"
//                                 rules={[{ required: true, message: 'Please enter height' }]}
//                                 style={{ flex: 1 }}
//                             >
//                                 <InputNumber min={1} max={6} style={{ width: '100%' }} />
//                             </Form.Item>
//                         </div>

//                         <div className="form-actions" style={{ marginTop: '16px', textAlign: 'right' }}>
//                             <Button onClick={closeModal} style={{ marginRight: '8px' }}>
//                                 Cancel
//                             </Button>
//                             <Button
//                                 type="primary"
//                                 htmlType="submit"
//                                 loading={loading}

//                             >
//                                 {isEditMode ? 'Update Widget' : 'Add Widget'}
//                             </Button>
//                         </div>
//                     </Form>
//                 </Modal>
//             </Content>
//         </Layout>
//     );
// };

// export default DashboardVisualization;


/////// working code//////
// import { useState, useEffect, useContext } from 'react';
// import GridLayout from 'react-grid-layout';
// import { Responsive, WidthProvider } from 'react-grid-layout';
// import ReactApexChart from 'react-apexcharts';
// import { Modal, Button, Form, Input, Select, InputNumber, Typography, Divider, Card, Layout, Space, message, Cascader, Table, Popconfirm, DatePicker } from 'antd';
// import { PlusOutlined, EditOutlined, DeleteOutlined, DragOutlined } from '@ant-design/icons';
// import axios from 'axios';
// import { AuthContext } from '../../context/AuthContext';
// import 'react-grid-layout/css/styles.css';
// import 'react-resizable/css/styles.css';
// import './DashboardVisualization.css';
// import PivotTable from 'react-pivottable/PivotTable';
// import 'react-pivottable/pivottable.css';
// import dayjs from 'dayjs';
// import customParseFormat from 'dayjs/plugin/customParseFormat';
// import utc from 'dayjs/plugin/utc';

// dayjs.extend(customParseFormat);
// dayjs.extend(utc);

// const { Option } = Select;
// const { Title } = Typography;
// const { Header, Content } = Layout;
// const ResponsiveGridLayout = WidthProvider(Responsive);
// const { RangePicker } = DatePicker;

// const DashboardVisualization = () => {
//     const { globalPermissions, token } = useContext(AuthContext);
//     const [databaseTables, setDatabaseTables] = useState([]);
//     const [tableFields, setTableFields] = useState([]);
//     const [loadingFields, setLoadingFields] = useState(false);
//     const [selectedTable, setSelectedTable] = useState(null);
//     const [widgets, setWidgets] = useState([]);
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [currentWidget, setCurrentWidget] = useState(null);
//     const [isEditMode, setIsEditMode] = useState(false);
//     const [nextId, setNextId] = useState(4);
//     const [form] = Form.useForm();
//     const [selectedTableColumns, setSelectedTableColumns] = useState([]);
//     const [layoutChanged, setLayoutChanged] = useState(false);
//     const [loading, setLoading] = useState(false);
//     const [headers, setHeaders] = useState([]);
//     const [chartData, setChartData] = useState({});
//     const [tableRawData, setTableRawData] = useState([]);
//     const [isDataPopulated, setIsDataPopulated] = useState(false);
//     const [selectedDateRange, setSelectedDateRange] = useState([]);

//     const chartTypes = [
//         { value: 'pie', label: 'Pie Chart' },
//         { value: 'donut', label: 'Donut Chart' },
//         { value: 'bar', label: 'Bar Chart' },
//         { value: 'line', label: 'Line Chart' },
//         { value: 'area', label: 'Area Chart' },
//         { value: 'NormalTable', label: 'Normal Table' },
//         { value: 'pivot', label: 'Pivot Table' },
//     ];

//     const radarTypes = [
//         { value: 'radar-standard', label: 'Standard Radar Chart' },
//         { value: 'radar-filled', label: 'Filled Radar Chart' },
//         { value: 'radar-polar', label: 'Polar Area Chart' },
//     ];

//     const aggregationOptions = [
//         { value: 'sum', label: 'Sum' },
//         { value: 'stdDev', label: 'Standard Deviation' },
//         { value: 'varPop', label: 'Variance Population' },
//         { value: 'max', label: 'Max' },
//         { value: 'min', label: 'Min' },
//         { value: 'median', label: 'Median' },
//         { value: 'mean', label: 'Mean' },
//         { value: 'distinct', label: 'Distinct' },
//         { value: 'countByValue', label: 'Count by Value' },
//         { value: 'count', label: 'Count' },
//     ];

//     const applyAggregation = (data, aggregationType) => {
//         if (!data || !Array.isArray(data) || data.length === 0 || !aggregationType) {
//             return data || [];
//         }
//         const numericData = data.map(val => parseFloat(val)).filter(val => !isNaN(val));
//         if (numericData.length === 0) {
//             return data;
//         }
//         switch (aggregationType) {
//             case 'sum':
//                 return parseFloat(numericData.reduce((a, b) => a + b, 0).toFixed(2));
//             case 'mean':
//                 return parseFloat((numericData.reduce((a, b) => a + b, 0) / numericData.length).toFixed(2));
//             case 'max':
//                 return parseFloat(Math.max(...numericData).toFixed(2));
//             case 'min':
//                 return parseFloat(Math.min(...numericData).toFixed(2));
//             case 'stdDev': {
//                 const mean = numericData.reduce((a, b) => a + b, 0) / numericData.length;
//                 const variance = numericData.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / numericData.length;
//                 return parseFloat(Math.sqrt(variance).toFixed(2));
//             }
//             case 'varPop': {
//                 const mean = numericData.reduce((a, b) => a + b, 0) / numericData.length;
//                 return parseFloat((numericData.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / numericData.length).toFixed(2));
//             }
//             case 'median': {
//                 const sorted = [...numericData].sort((a, b) => a - b);
//                 const mid = Math.floor(sorted.length / 2);
//                 const median = sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
//                 return parseFloat(median.toFixed(2));
//             }
//             case 'distinct':
//                 return [...new Set(data)];
//             case 'countByValue': {
//                 const counts = {};
//                 data.forEach(val => { counts[val] = (counts[val] || 0) + 1; });
//                 return counts;
//             }
//             case 'count':
//                 return data.length;
//             default:
//                 return data;
//         }
//     };

//     useEffect(() => {
//         const maxId = Math.max(...widgets.map((w) => parseInt(w.i)), -1);
//         setNextId(maxId + 1);
//         fetchDatabaseTables();
//         fetchDashboardWidgets();
//     }, [widgets?.length]);

//     useEffect(() => {
//         const fetchDataForWidget = async (widget) => {
//             const { tableId, xColumn, yColumns = [], _id } = widget;
//             if (tableId && xColumn && yColumns.length > 0 && _id) {
//                 const { labels, series } = await fetchChartData(tableId, xColumn, yColumns, _id);
//                 setChartData((prev) => ({
//                     ...prev,
//                     [widget.i]: { labels, series },
//                 }));
//             }
//         };

//         widgets.forEach((widget) => {
//             fetchDataForWidget(widget);
//         });
//     }, [widgets]);

//     const fetchDatabaseTables = async () => {
//         setLoading(true);
//         try {
//             const response = await axios.get(`${import.meta.env.VITE_API_URI}/api/data/get-all-tables`, {
//                 headers: { Authorization: `Bearer ${token}` },
//             });

//             if (response?.data?.data) {
//                 setDatabaseTables(response.data.data);
//             }
//         } catch (error) {
//             message.error('Failed to load database tables');
//             setDatabaseTables([]);
//         } finally {
//             setLoading(false);
//         }
//     };




//     const fetchDashboardWidgets = async () => {
//         setLoading(true);
//         try {
//             const widgetResponse = await axios.get(`${import.meta.env.VITE_API_URI}/api/data/dynamic_dashboard`, {
//                 headers: { Authorization: `Bearer ${token}` },
//             });
    
//             if (!widgetResponse?.data?.data) {
//                 setWidgets([]);
//                 return;
//             }
    
//             const fetchedWidgets = Array.isArray(widgetResponse.data.data)
//                 ? widgetResponse.data.data
//                 : [widgetResponse.data.data];
    
//             const activeWidgets = fetchedWidgets.filter((widget) => !widget.isDeleted);
    
//             const formattedWidgets = activeWidgets.map((widget) => ({
//                 _id: widget._id,
//                 i: widget.i?.toString(),
//                 title: widget.title,
//                 yData: widget.yData || [],
//                 type: widget.type,
//                 xAxis: widget.xAxis,
//                 yAxes: Array.isArray(widget.yAxes) ? widget.yAxes : [widget.yAxes],
//                 labels: Array.isArray(widget.labels) ? widget.labels : JSON.parse(widget.labels || '[]'),
//                 data: Array.isArray(widget.data) ? widget.data : [JSON.parse(widget.data || '[]')],
//                 x: widget.x || 0,
//                 y: widget.y || 0,
//                 w: widget.w || 4,
//                 h: widget.h || 3,
//                 tableId: widget.tableId,
//                 xColumn: widget.xColumn,
//                 yColumns: Array.isArray(widget.yColumns) ? widget.yColumns : [widget.yColumns],
//                 aggregations: widget.aggregations || [],
//                 created_at: widget.created_at || widget.createdAt, // Check both fields
//                 updated_at: widget.updated_at
//             }));
    
//             setWidgets(formattedWidgets);
//             const maxId = Math.max(...formattedWidgets.map(w => parseInt(w.i) || 0), -1);
//             setNextId(maxId + 1);
//         } catch (error) {
//             console.error('Error fetching widgets:', error);
//             message.error('Failed to load dashboard widgets');
//             setWidgets([]);
//         } finally {
//             setLoading(false);
//         }
//     };

    

//     useEffect(() => {
//         fetchDashboardWidgets();
//     }, [selectedDateRange]);

//     const fetchTableFields = async (tableName) => {
//         setLoadingFields(true);
//         try {
//             const response = await axios.get(`${import.meta.env.VITE_API_URI}/api/data/${tableName}`, {
//                 headers: { Authorization: `Bearer ${token}` },
//             });

//             let allFieldNames = [];
//             if (response.data.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
//                 const responseData = response.data.data;
//                 setTableRawData(responseData);
//                 const uniqueFields = new Set();
//                 responseData.forEach((row) => {
//                     Object.keys(row).forEach((key) => uniqueFields.add(key));
//                 });
//                 allFieldNames = Array.from(uniqueFields);
//                 setHeaders(allFieldNames);
//             } else {
//                 setTableRawData([]);
//             }

//             if (response.data.fields && Array.isArray(response.data.fields)) {
//                 allFieldNames = response.data.fields.map((field) => field.name);
//                 setTableFields(response.data.fields);
//             } else {
//                 setTableFields(allFieldNames.map((name) => ({ name })));
//             }

//             setSelectedTableColumns(allFieldNames);
//         } catch (error) {
//             console.error('Error fetching table fields:', error);
//             message.error('Failed to load table fields');
//             setTableFields([]);
//             setTableRawData([]);
//             setHeaders([]);
//             setSelectedTableColumns([]);
//         } finally {
//             setLoadingFields(false);
//         }
//     };

//     const handleLayoutChange = (layout) => {
//         setWidgets(widgets.map((widget) => {
//             const layoutItem = layout.find((item) => item.i === widget.i);
//             return layoutItem ? { ...widget, x: layoutItem.x, y: layoutItem.y, w: layoutItem.w, h: layoutItem.h } : widget;
//         }));
//         setLayoutChanged(true);
//     };

//     const openAddModal = async () => {
//         form.resetFields();
//         await fetchDatabaseTables();
//         const defaultTable = databaseTables.length > 0 ? databaseTables[0] : null;
//         let defaultFields = [];
//         let defaultData = [];
//         let defaultLabels = [];

//         if (defaultTable) {
//             await fetchTableFields(defaultTable);
//             defaultFields = selectedTableColumns.length > 0 ? selectedTableColumns : ['X Axis', 'Y Axis'];
//             defaultLabels = tableRawData.length > 0 ? tableRawData.slice(0, 3).map((row) => row[defaultFields[0]] || 'Label') : ['Label 1', 'Label 2', 'Label 3'];
//             defaultData = tableRawData.length > 0 ? [tableRawData.slice(0, 3).map((row) => row[defaultFields[1]] || 0)] : [[10, 20, 30]];
//         } else {
//             defaultFields = ['X Axis', 'Y Axis'];
//             defaultLabels = ['Label 1', 'Label 2', 'Label 3'];
//             defaultData = [[10, 20, 30]];
//         }

//         const newWidget = {
//             i: nextId.toString(),
//             type: '',
//             x: 0,
//             y: 0,
//             w: 3,
//             h: 3,
//             title: ' ',
//             xAxis: defaultFields[0],
//             yAxes: defaultFields[1],
//             labels: defaultLabels,
//             data: defaultData,
//             tableId: defaultTable,
//             xColumn: defaultFields[0],
//             yColumns: defaultFields[1],
//             aggregations: [],
//         };

//         setCurrentWidget(newWidget);
//         setIsEditMode(false);
//         setIsModalOpen(true);
//     };

//     const openEditModal = (widget) => {
//         setCurrentWidget({ ...widget });
//         setIsEditMode(true);
//         setIsModalOpen(true);
//         if (widget.tableId) {
//             fetchTableFields(widget.tableId);
//         } else {
//             setSelectedTableColumns([]);
//         }

//         const yColumnValues = Array.isArray(widget.yColumns) ? widget.yColumns.map(col => [widget.tableId, col]) : [];
//         form.setFieldsValue({
//             title: widget.title,
//             type: widget.type,
//             xAxis: widget.xAxis,
//             yData: widget.yData,
//             labels: Array.isArray(widget.labels) ? widget.labels.join(', ') : '',
//             w: widget.w,
//             h: widget.h,
//             tableAndFields: widget.tableId && widget.xColumn ? [widget.tableId, widget.xColumn] : undefined,
//             yColumns: yColumnValues
//         });
//     };

//     const closeModal = () => {
//         setIsModalOpen(false);
//         setCurrentWidget(widgets.find((w) => w.i === currentWidget.i));
//     };

//     const handleWidgetDelete = async (widgetId) => {
//         try {
//             setLoading(true);
//             const widgetToDelete = widgets.find((w) => w._id === widgetId);

//             if (!widgetToDelete) {
//                 console.error('Widget not found in state for ID:', widgetId);
//                 message.error('Widget not found');
//                 return;
//             }

//             if (widgetToDelete._id) {
//                 await axios.delete(
//                     `${import.meta.env.VITE_API_URI}/api/data/dynamic_dashboard/${widgetToDelete._id}`,
//                     {
//                         headers: { Authorization: `Bearer ${token}` },
//                     }
//                 );

//                 setWidgets((prevWidgets) => prevWidgets.filter((w) => w._id !== widgetId));
//                 message.success('Widget deleted successfully');
//                 await fetchDashboardWidgets();
//             } else {
//                 console.warn('No _id found for widget:', widgetId);
//                 setWidgets((prevWidgets) => prevWidgets.filter((w) => w._id !== widgetId));
//                 message.warning('Widget removed locally (no database ID)');
//             }
//         } catch (error) {
//             console.error('Error deleting widget:', {
//                 message: error.message,
//                 response: error.response?.data,
//                 status: error.response?.status,
//             });
//             message.error(`Failed to delete widget: ${error.response?.data?.message || error.message}`);
//         } finally {
//             setLoading(false);
//             setLayoutChanged(true);
//         }
//     };

//     const updateXLabels = (xField) => {
//         if (!tableRawData || !Array.isArray(tableRawData) || tableRawData.length === 0 || !xField) {
//             form.setFieldsValue({ labels: '', xAxis: xField || 'X Axis' });
//             setIsDataPopulated(false);
//             return;
//         }

//         try {
//             const uniqueLabels = Array.from(
//                 new Set(tableRawData.map((item) => String(item[xField] || '')))
//             ).filter((label) => label !== '');

//             if (uniqueLabels.every(label => !isNaN(Number(label)))) {
//                 uniqueLabels.sort((a, b) => Number(a) - Number(b));
//             }

//             form.setFieldsValue({ labels: uniqueLabels.join(', '), xAxis: xField });
//             setIsDataPopulated(true);
//         } catch (error) {
//             console.error('Error updating X labels:', error);
//             message.error('Failed to update chart labels');
//             setIsDataPopulated(false);
//         }
//     };

//     const updateYValues = (yField, index) => {
//         if (!tableRawData || !Array.isArray(tableRawData) || tableRawData.length === 0 || !yField) {
//             const yData = form.getFieldValue('yData') || [];
//             yData[index] = { ...yData[index], data: '', yAxes: yField || 'Y Axis' };
//             form.setFieldsValue({ yData });
//             setIsDataPopulated(false);
//             return;
//         }

//         try {
//             const allValues = tableRawData
//                 .map((item) => parseFloat(item[yField] || 0).toFixed(2))
//                 .filter((value) => value !== '0.00');
//             const yData = form.getFieldValue('yData') || [];
//             yData[index] = { ...yData[index], data: allValues.join(', '), yAxes: yField };
//             form.setFieldsValue({ yData });
//             setIsDataPopulated(true);
//         } catch (error) {
//             console.error('Error updating Y values:', error);
//             message.error('Failed to update chart values');
//             setIsDataPopulated(false);
//         }
//     };

//     const handleFormSubmit = async (values) => {
//         try {
//             setLoading(true);

//             const { tableAndFields, type, title, w, h, yData } = values;
//             const tableId = tableAndFields[0];
//             const xColumn = tableAndFields[1];
//             const yCols = yData.map((item) => item.yColumns?.[1]).filter(Boolean);
//             const aggregations = yData.map((item) => item.aggregation || null);

//             const widgetData = {
//                 i: isEditMode ? currentWidget.i : nextId.toString(),
//                 title,
//                 type,
//                 yData,
//                 xAxis: xColumn,
//                 yAxes: yCols,
//                 x: isEditMode ? currentWidget.x : 0,
//                 y: isEditMode ? currentWidget.y : 0,
//                 w,
//                 h,
//                 tableId,
//                 xColumn,
//                 yColumns: yCols,
//                 aggregations,
//                 created_at: isEditMode ? currentWidget.created_at : new Date().toISOString(),
//                 updated_at: new Date().toISOString(),
//             };

//             if (isEditMode) {
//                 await axios.put(
//                     `${import.meta.env.VITE_API_URI}/api/data/dynamic_dashboard/${currentWidget._id}`,
//                     widgetData,
//                     { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
//                 );
//                 setWidgets(prevWidgets =>
//                     prevWidgets.map(widget =>
//                         widget._id === currentWidget._id
//                             ? { ...widgetData, _id: currentWidget._id }
//                             : widget
//                     )
//                 );
//             } else {
//                 const response = await axios.post(
//                     `${import.meta.env.VITE_API_URI}/api/data/dynamic_dashboard`,
//                     widgetData,
//                     { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
//                 );

//                 const newWidget = {
//                     ...widgetData,
//                     _id: response.data._id || response.data.insertedId,
//                 };

//                 setWidgets(prevWidgets => [...prevWidgets, newWidget]);
//                 setNextId(prev => prev + 1);
//             }

//             message.success(`Widget ${isEditMode ? 'updated' : 'added'} successfully`);
//             closeModal();
//         } catch (error) {
//             console.error(`Error ${isEditMode ? 'updating' : 'adding'} widget:`, error);
//             message.error(`Failed to ${isEditMode ? 'update' : 'add'} widget: ${error.message}`);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const getChartOptions = (widget, labels) => {
//         const baseOptions = {
//             chart: {
//                 id: `chart-${widget.i}`,
//                 toolbar: { show: true },
//                 type: widget.type,
//             },
//             tooltip: { enabled: true },
//         };

//         if (widget.type === 'pie' || widget.type === 'donut') {
//             return {
//                 ...baseOptions,
//                 labels: labels,
//                 legend: { position: 'bottom' },
//                 chart: {
//                     ...baseOptions.chart,
//                     type: widget.type === 'donut' ? 'donut' : 'pie',
//                 },
                
//                 plotOptions: {
//                     pie: {
//                         donut: {
//                             size: '55%',
//                             customScale: 0.8,
//                         },
//                         dataLabels: {
//                             offset: 0,
//                             minAngleToShowLabel: 10
//                         },
//                     },
//                 },
//                 dataLabels: {
//                     enabled: true,
//                     formatter: function (val, opts) {
//                         const value = opts.w.config.series[opts.dataPointIndex];
//                         return value === 0 ? '0' : value;
//                     },
//                     style: {
//                         fontSize: '12px',
//                         fontFamily: 'Arial',
//                     },
//                 },
//             };
//         } else if (widget.type.startsWith('radar')) {
//             const radarType = widget.type.split('-')[1] || 'standard';
//             const isPolar = radarType === 'polar';

//             return {
//                 ...baseOptions,
//                 chart: {
//                     ...baseOptions.chart,
//                     type: 'radar',
//                 },
//                 xaxis: {
//                     categories: labels,
//                 },
//                 yaxis: {
//                     min: 0,
//                     forceNiceScale: true,
//                     title: {
//                         text: widget.yAxes[0] ? `${widget.yAxes[0]}${widget.aggregations[0] ? ` (${widget.aggregations[0]})` : ''}` : '',
//                         style: {
//                             fontSize: '14px',
//                             fontWeight: 'bold',
//                         },
//                     },
//                 },
//                 fill: {
//                     opacity: isPolar || radarType === 'filled' ? 0.8 : 0,
//                     colors: isPolar || radarType === 'filled' ? ['#FF9800'] : undefined,
//                 },
//                 stroke: {
//                     show: !isPolar,
//                     width: radarType === 'filled' ? 0 : 2,
//                     colors: radarType === 'standard' ? ['#F44336'] : undefined,
//                 },
//                 markers: {
//                     size: radarType === 'standard' ? 4 : 0,
//                     colors: ['#F44336'],
//                 },
//                 plotOptions: {
//                     radar: {
//                         polygons: {
//                             strokeColors: '#e8e8e8',
//                             fill: {
//                                 colors: isPolar ? ['rgba(55, 150, 251, 0.85)'] : ['#f8f8f8'],
//                             },
//                         },
//                     },
//                 },
//                 dataLabels: {
//                     enabled: true,
//                     formatter: function (val) {
//                         return val === 0 ? '0' : val;
//                     },
//                     style: {
//                         fontSize: '12px',
//                         fontFamily: 'Arial',
//                     },
//                 },
//             };
//         } else {
//             const chartSpecificOptions = {
//                 bar: {
//                     plotOptions: {
//                         bar: {
//                             endingShape: 'rounded',
//                         },
//                         states: {
//                             hover: {
//                                 filter: {
//                                     type: 'none',
//                                 },
//                             },
//                         },
//                         grid: {
//                             padding: {
//                                 left: 0,
//                                 right: 0,
//                             },
//                         },
//                     },
//                     dataLabels: {
//                         enabled: true,
//                         formatter: function (val) {
//                             return val === 0 ? '0' : val;
//                         },
//                         style: {
//                             fontSize: '12px',
//                             fontFamily: 'Arial',
//                         },
//                         offsetY: -10,
//                     },
//                 },
//                 line: {
//                     stroke: {
//                         width: 4,
//                         curve: 'smooth',
//                         lineCap: 'round',
//                     },
//                     markers: {
//                         size: 5,
//                         strokeWidth: 2,
//                         hover: {
//                             size: 8,
//                         },
//                     },
//                     dataLabels: {
//                         enabled: true,
//                         formatter: function (val) {
//                             return val === 0 ? '0' : val;
//                         },
//                     },
//                 },
//                 area: {
//                     fill: {
//                         type: 'gradient',
//                         gradient: {
//                             shadeIntensity: 1,
//                             opacityFrom: 0.9,
//                             opacityTo: 0.6,
//                         },
//                     },
//                     dataLabels: {
//                         enabled: true,
//                         formatter: function (val) {
//                             return val === 0 ? '0' : val;
//                         },
//                     },
//                 },
//             };

//             const specificOptions = chartSpecificOptions[widget.type] || {};

//             return {
//                 ...baseOptions,
//                 ...specificOptions,
//                 chart: {
//                     ...baseOptions.chart,
//                     type: widget.type,
//                 },
//                 xaxis: {
//                     categories: widget.labels,
//                     label: {
//                         text: widget.xAxis || 'X-Axis',
//                         style: {
//                             fontSize: '14px',
//                             fontWeight: 'bold',
//                             fontFamily: 'Arial',
//                         },
//                         offsetY: 10,
//                     },
//                     axisBorder: { show: true },
//                     axisTicks: { show: true },
//                 },
//                 yaxis: widget.yAxes.map((title, idx) => ({
//                     title: {
//                         text: `${title}${widget.aggregations[idx] ? ` (${widget.aggregations[idx]})` : ''}`,
//                         style: {
//                             fontSize: '14px',
//                             fontWeight: 'bold',
//                         },
//                     },
//                     min: 0,
//                     forceNiceScale: true,
//                     opposite: idx % 2 === 1,
//                 })),
//             };
//         }
//     };

//     // Updated fetchChartData

//     const fetchChartData = async (tableId, xColumn, yColumns, widgetId) => {
//         try {
//             const response = await axios.get(`${import.meta.env.VITE_API_URI}/api/data/${tableId}`, {
//                 headers: { Authorization: `Bearer ${token}` },
//             });
    
//             if (!response.data.data) {
//                 return { labels: [], series: [] };
//             }
    
//             const currentWidget = widgets.find(w => w._id === widgetId);
//             if (!currentWidget) {
//                 console.error('Widget not found:', widgetId);
//                 return { labels: [], series: [] };
//             }
    
//             const uniqueLabels = [...new Set(response.data.data.map(row => row[xColumn] || ''))];
//             const hasDateRange = selectedDateRange.length === 2;
//             const startDate = hasDateRange ? dayjs(selectedDateRange[0], 'YYYY-MM-DD').startOf('day') : null;
//             const endDate = hasDateRange ? dayjs(selectedDateRange[1], 'YYYY-MM-DD').endOf('day') : null;
    
//             const isPieOrDonut = currentWidget.type === 'pie' || currentWidget.type === 'donut';
//             const isRadar = currentWidget.type.startsWith('radar');
    
//             const seriesData = yColumns.map((yCol, index) => {
//                 const groupedData = uniqueLabels.map(label => {
//                     const matchingRecords = response.data.data.filter(row => row[xColumn] === label);
    
//                     if (!hasDateRange) {
//                         const aggregationType = currentWidget.aggregations?.[index];
//                         if (aggregationType === 'count') {
//                             return matchingRecords.length;
//                         } else if (aggregationType) {
//                             const groupValues = matchingRecords.map(row => parseFloat(row[yCol]) || 0);
//                             return applyAggregation(groupValues, aggregationType);
//                         } else {
//                             return matchingRecords.length > 0 ? parseFloat(matchingRecords[0][yCol]) || 0 : 0;
//                         }
//                     }
    
//                     const dateMatches = matchingRecords.filter(row => {
//                         // Check both created_at and createdAt fields
//                         const dateField = row.created_at || row.createdAt;
//                         if (!dateField) return false;
                        
//                         const recordDate = dayjs(dateField, 'DD-MM-YYYY HH:mm:ss');
//                         return recordDate.isValid() &&
//                             recordDate.isAfter(startDate) &&
//                             recordDate.isBefore(endDate);
//                     });
    
//                     if (dateMatches.length === 0) {
//                         return 0;
//                     }
    
//                     const aggregationType = currentWidget.aggregations?.[index];
//                     if (aggregationType === 'count') {
//                         return dateMatches.length;
//                     } else if (aggregationType) {
//                         const groupValues = dateMatches.map(row => parseFloat(row[yCol]) || 0);
//                         return applyAggregation(groupValues, aggregationType);
//                     } else {
//                         return dateMatches.length > 0 ? parseFloat(dateMatches[0][yCol]) || 0 : 0;
//                     }
//                 });
    
//                 return {
//                     name: `${yCol} ${currentWidget.aggregations[index] ? `(${aggregationOptions.find(opt => opt.value === currentWidget.aggregations[index])?.label})` : ''}`,
//                     data: groupedData.map(val => parseFloat(val) || 0)
//                 };
//             });
    
//             let series;
//             if (isPieOrDonut) {
//                 series = seriesData.length > 0 ? seriesData[0].data : [];
//             } else if (isRadar) {
//                 series = seriesData;
//             } else {
//                 series = seriesData;
//             }
    
//             return {
//                 labels: uniqueLabels,
//                 series
//             };
//         } catch (error) {
//             console.error('Error fetching chart data:', error);
//             message.error('Failed to fetch chart data');
//             return { labels: [], series: [] };
//         }
//     };


  
 
//     const renderNormalTable = (widget, data) => {
//         if (!data || !data.series || !data.labels) return null;

//         const normalTableData = data.labels.map((label, index) => {
//             const row = { xAxis: label };
//             data.series.forEach(series => {
//                 row[series.name] = series.data[index];
//             });
//             return row;
//         });

//         const columns = [
//             {
//                 title: widget.xAxis || 'Category',
//                 dataIndex: 'xAxis',
//                 key: 'xAxis',
//                 fixed: 'left',
//             },
//             ...data.series.map(series => ({
//                 title: series.name,
//                 dataIndex: series.name,
//                 key: series.name,
//                 sorter: (a, b) => (a[series.name] || 0) - (b[series.name] || 0),
//                 render: (value) => typeof value === 'number' ? value.toFixed(2) : value,
//             }))
//         ];

//         return (
//             <Table
//                 dataSource={normalTableData}
//                 columns={columns}
//                 scroll={{ x: true }}
//                 pagination={false}
//                 size="small"
//                 bordered
//                 style={{ height: '100%', overflow: 'auto' }}
//             />
//         );
//     };

//     const renderPivot = (widget, data) => {
//         if (!data || !data.series || !data.labels) return null;

//         const pivotData = data.labels.flatMap((label, index) => {
//             return data.series.map(series => ({
//                 [widget.xAxis]: label,
//                 'Measure': series.name,
//                 'Value': parseFloat(series.data[index]) || 0
//             }));
//         });

//         const getAggregatorName = (aggregationType) => {
//             switch (aggregationType) {
//                 case 'sum': return 'Sum';
//                 case 'mean': return 'Average';
//                 case 'count': return 'Count';
//                 case 'min': return 'Minimum';
//                 case 'max': return 'Maximum';
//                 case 'countByValue': return 'Count Unique Values';
//                 default: return 'Sum';
//             }
//         };

//         const selectedAggregation = widget.aggregations?.[0] || 'sum';
//         const aggregatorName = getAggregatorName(selectedAggregation);
//         const aggregatedData = pivotData.map(item => {
//             const value = item['Value'];
//             const aggregatedValue = applyAggregation([value], selectedAggregation);
//             return {
//                 ...item,
//                 'Value': aggregatedValue
//             };
//         });

//         return (
//             <div style={{ height: '100%', overflow: 'auto' }}>
//                 <PivotTable
//                     data={aggregatedData}
//                     rows={[widget.xAxis]}
//                     cols={['Measure']}
//                     vals={['Value']}
//                     aggregatorName={aggregatorName}
//                     rendererName="Table"
//                     sorters={{ Value: (a, b) => parseFloat(a) - parseFloat(b) }}
//                     unusedOrientationCutoff={Infinity}
//                 />
//             </div>
//         );
//     };

//     // Updated renderChart
//     const renderChart = (widget) => {
//         const { labels, series } = chartData[widget.i] || { labels: [], series: [] };
//         const options = {
//             ...getChartOptions(widget, labels),
//             widget: widget
//         };

//         let chartSeries;

//         if (widget.type === 'pivot') {
//             return renderPivot(widget, { labels, series });
//         }
//         if (widget.type === 'NormalTable') {
//             return renderNormalTable(widget, { labels, series });
//         }

//         if (widget.type === 'pie' || widget.type === 'donut') {
//             // Pie and Donut expect a flat array of numbers
//             chartSeries = Array.isArray(series) && series.length > 0
//                 ? series.map(val => parseFloat(val) || 0) // Flatten if series is an array of numbers
//                 : [];
//         } else if (widget.type.startsWith('radar')) {
//             // Radar expects an array of objects with name and data
//             chartSeries = Array.isArray(series) && series.length > 0
//                 ? series.map(s => ({
//                     name: s.name,
//                     data: s.data.map(val => parseFloat(val) || 0)
//                 }))
//                 : [];
//         } else {
//             // Bar, Line, Area expect an array of objects with name and data
//             chartSeries = Array.isArray(series) && series.length > 0
//                 ? series.map(s => ({
//                     name: s.name,
//                     data: s.data.map(val => parseFloat(val) || 0)
//                 }))
//                 : [];
//         }

//         return (
//             <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
//                 <div style={{ flex: 1 }}>
//                     <ReactApexChart
//                         options={{
//                             ...options,
//                             xaxis: {
//                                 ...options.xaxis,
//                                 categories: labels // Ensure categories are always set
//                             },
//                             tooltip: {
//                                 shared: true,
//                                 intersect: false,
//                             },
//                             chart: {
//                                 ...options.chart,
//                                 animations: {
//                                     enabled: true,
//                                 },
//                                 dropShadow: {
//                                     enabled: true,
//                                     blur: 3,
//                                     opacity: 0.2,
//                                 },
//                             },
//                         }}
//                         series={chartSeries}
//                         type={widget.type.startsWith('radar') ? 'radar' : widget.type}
//                         height="95%"
//                     />
//                 </div>
//                 <div style={{
//                     textAlign: 'center',
//                     padding: '6px',
//                     fontWeight: 'bold',
//                     fontSize: '14px'
//                 }}>
//                     {widget.xAxis}
//                 </div>
//             </div>
//         );
//     };
    

  

//     return (
//         <Layout className="dashboard-layout">
//             <Header className="dashboard-header">
//                 <Title level={3} style={{ color: 'white', margin: 0 }}>
//                     Dashboard Visualization
//                 </Title>
//                 <Space>
//                     <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal}>
//                         Add Widget
//                     </Button>
//                 </Space>
//             </Header>
//             <div style={{ marginBottom: '16px', textAlign: 'right', padding: '20px 24px' }}>
//                 <RangePicker
//                     defaultValue={[dayjs(), dayjs()]}
//                     value={selectedDateRange.length === 2 ? [
//                         dayjs(selectedDateRange[0]),
//                         dayjs(selectedDateRange[1])
//                     ] : null}
//                     onChange={(dates, dateStrings) => {
//                         if (!dates || dateStrings.every(date => date === '')) {
//                             setSelectedDateRange([]);
//                         } else {
//                             setSelectedDateRange(dateStrings.map(date =>
//                                 dayjs(date, 'DD-MM-YYYY').format('YYYY-MM-DD')
//                             ));
//                         }
//                         console.log('Selected Date Range:>>>.-----', dateStrings);
//                     }}
//                     style={{ width: '250px' }}
//                     placeholder={['Start Date', 'End Date']}
//                     format="DD-MM-YYYY"
//                     allowClear={true}
//                 />
//             </div>

//             <Content className="dashboard-content">
//                 <ResponsiveGridLayout
//                     className="layout"
//                     layouts={{
//                         lg: widgets.map(widget => ({
//                             ...widget,
//                             i: widget.i,
//                             x: widget.x || 0,
//                             y: widget.y || 0,
//                             w: widget.w || 4,
//                             h: widget.h || 3,
//                         })),
//                         md: widgets.map(widget => ({
//                             ...widget,
//                             i: widget.i,
//                             x: widget.x || 0,
//                             y: widget.y || 0,
//                             w: Math.min(widget.w || 4, 6),
//                             h: widget.h || 3,
//                         })),
//                         sm: widgets.map(widget => ({
//                             ...widget,
//                             i: widget.i,
//                             x: 0,
//                             y: widget.y || 0,
//                             w: 12,
//                             h: widget.h || 3,
//                         })),
//                         xs: widgets.map(widget => ({
//                             ...widget,
//                             i: widget.i,
//                             x: 0,
//                             y: widget.y || 0,
//                             w: 12,
//                             h: widget.h || 3,
//                         })),
//                     }}
//                     breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
//                     cols={{ lg: 12, md: 6, sm: 12, xs: 12 }}
//                     rowHeight={100}
//                     margin={[10, 10]}
//                     containerPadding={[15, 15]}
//                     onLayoutChange={handleLayoutChange}
//                     draggableHandle=".drag-handle"
//                     isResizable={true}
//                     isDraggable={true}
//                     style={{ minHeight: '100vh' }}
//                 >
//                     {widgets.map((widget) => (
//                         <div key={widget.i} className="widget-container">
//                             <Card
//                                 title={
//                                     <div className="drag-handle">
//                                         <DragOutlined className="drag-icon" /> {widget.title}
//                                     </div>
//                                 }
//                                 extra={
//                                     <Space>
//                                         <Button
//                                             type="text"
//                                             icon={<EditOutlined />}
//                                             onClick={() => openEditModal(widget)}
//                                             className="edit-button"
//                                         />
//                                         <Popconfirm
//                                             title="Are you sure you want to delete this widget?"
//                                             description="This action cannot be undone."
//                                             onConfirm={() => handleWidgetDelete(widget._id)}
//                                             onCancel={() => { }}
//                                             okText="Yes"
//                                             cancelText="No"
//                                             placement="topRight"
//                                         >
//                                             <Button
//                                                 type="text"
//                                                 icon={<DeleteOutlined />}
//                                                 className="delete-button"
//                                             />
//                                         </Popconfirm>
//                                     </Space>
//                                 }
//                                 bordered={true}
//                                 className="widget-card"
//                                 style={{ height: '100%' }}
//                             >
//                                 <div className="widget-content">
//                                     {chartData[widget.i] ? (
//                                         renderChart(widget)
//                                     ) : (
//                                         <Typography.Text type="secondary">Loading chart data...</Typography.Text>
//                                     )}
//                                 </div>
//                                 {widget.tableId && (
//                                     <div className="widget-data-source">
//                                         <Typography.Text type="secondary">
//                                             Data source: {widget.tableId} ({widget.xColumn} → {widget.yColumns.join(', ')})
//                                             {widget.aggregations.some((agg) => agg) ? ` [${widget.aggregations.filter((agg) => agg).join(', ')}]` : ''}
//                                         </Typography.Text>
//                                     </div>
//                                 )}
//                             </Card>
//                         </div>
//                     ))}
//                 </ResponsiveGridLayout>

//                 <Modal
//                     title={isEditMode ? 'Edit Widget' : 'Add New Widget'}
//                     open={isModalOpen}
//                     onCancel={closeModal}
//                     footer={null}
//                     width={700}
//                     confirmLoading={loading}
//                 >
//                     <Form
//                         form={form}
//                         layout="vertical"
//                         onFinish={handleFormSubmit}
//                     >
//                         <Form.Item
//                             name="title"
//                             label="Widget Title"
//                             rules={[{ required: true, message: 'Please enter a widget title' }]}
//                         >
//                             <Input placeholder="Enter widget title" />
//                         </Form.Item>

//                         <Form.Item
//                             name="type"
//                             label="Chart Type"
//                             rules={[{ required: true, message: 'Please select a chart type' }]}
//                         >
//                             <Select placeholder="Select chart type">
//                                 {chartTypes.map((type) => (
//                                     <Option key={type.value} value={type.value}>
//                                         {type.label}
//                                     </Option>
//                                 ))}
//                                 <Select.OptGroup label="Radar Charts">
//                                     {radarTypes.map((type) => (
//                                         <Option key={type.value} value={type.value}>
//                                             {type.label}
//                                         </Option>
//                                     ))}
//                                 </Select.OptGroup>
//                             </Select>
//                         </Form.Item>

//                         <Divider>Data Source</Divider>
//                         <Form.Item name="tableAndFields" label="X Axis">
//                             <Cascader
//                                 options={databaseTables.map((table) => ({
//                                     value: table,
//                                     label: table,
//                                     children: (headers || []).map((header) => ({ value: header, label: header })),
//                                 }))}
//                                 placeholder="Select table → X field"
//                                 onChange={(value) => {
//                                     if (value && value.length > 0) {
//                                         const tableName = value[0];
//                                         setSelectedTable(tableName);
//                                         fetchTableFields(tableName);
//                                         if (value.length === 2) updateXLabels(value[1]);
//                                     }
//                                     console.log(value);
//                                 }}
//                                 loadData={async (selectedOptions) => {
//                                     const targetOption = selectedOptions[0];
//                                     targetOption.loading = true;
//                                     await fetchTableFields(targetOption.value);
//                                     targetOption.loading = false;
//                                     targetOption.children = headers.map((header) => ({
//                                         value: header,
//                                         label: header,
//                                     }));
//                                     targetOption.loading = false;
//                                     setDatabaseTables([...databaseTables]);
//                                 }}
//                             />
//                         </Form.Item>

//                         <Form.List name="yData">
//                             {(fields, { add, remove }) => (
//                                 <>
//                                     {fields.map(({ key, name, ...restField }, index) => (
//                                         <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
//                                             <Form.Item
//                                                 {...restField}
//                                                 name={[name, 'aggregation']}
//                                                 label={`Aggregation ${index + 1}`}
//                                             >
//                                                 <Select placeholder="Select aggregation method" allowClear>
//                                                     {aggregationOptions.map((option) => (
//                                                         <Option key={option.value} value={option.value}>
//                                                             {option.label}
//                                                         </Option>
//                                                     ))}
//                                                 </Select>
//                                             </Form.Item>
//                                             <Form.Item
//                                                 {...restField}
//                                                 name={[name, 'yColumns']}
//                                                 label={`Y Axis Field ${index + 1}`}
//                                             >
//                                                 <Cascader
//                                                     options={databaseTables.map((table) => ({
//                                                         value: table,
//                                                         label: table,
//                                                         children: (headers || []).map((header) => ({ value: header, label: header })),
//                                                     }))}
//                                                     placeholder="Select table → Y field"
//                                                     onChange={(value) => {
//                                                         if (value && value.length > 0) {
//                                                             const tableName = value[0];
//                                                             setSelectedTable(tableName);
//                                                             fetchTableFields(tableName);
//                                                             if (value.length === 2) updateYValues(value[1]);
//                                                         }
//                                                         console.log("Selected Value....", value);
//                                                     }}
//                                                     loadData={async (selectedOptions) => {
//                                                         const targetOption = selectedOptions[0];
//                                                         targetOption.loading = true;
//                                                         await fetchTableFields(targetOption.value);
//                                                         targetOption.loading = false;
//                                                         targetOption.children = headers.map((header) => ({
//                                                             value: header,
//                                                             label: header,
//                                                         }));
//                                                         targetOption.loading = false;
//                                                         setDatabaseTables([...databaseTables]);
//                                                     }}
//                                                 />
//                                             </Form.Item>
//                                             {fields.length > 1 && (
//                                                 <Button onClick={() => remove(name)}>Remove</Button>
//                                             )}
//                                         </Space>
//                                     ))}
//                                     <Form.Item>
//                                         <Button
//                                             type="dashed"
//                                             onClick={() => add()}
//                                             block
//                                             icon={<PlusOutlined />}
//                                         >
//                                             Add Y Axis
//                                         </Button>
//                                     </Form.Item>
//                                 </>
//                             )}
//                         </Form.List>

//                         <Divider>Widget Size</Divider>
//                         <div style={{ display: 'flex', gap: '16px' }}>
//                             <Form.Item
//                                 name="w"
//                                 label="Width (columns)"
//                                 rules={[{ required: true, message: 'Please enter width' }]}
//                                 style={{ flex: 1 }}
//                             >
//                                 <InputNumber min={1} max={12} style={{ width: '100%' }} />
//                             </Form.Item>
//                             <Form.Item
//                                 name="h"
//                                 label="Height (rows)"
//                                 rules={[{ required: true, message: 'Please enter height' }]}
//                                 style={{ flex: 1 }}
//                             >
//                                 <InputNumber min={1} max={6} style={{ width: '100%' }} />
//                             </Form.Item>
//                         </div>

//                         <div className="form-actions" style={{ marginTop: '16px', textAlign: 'right' }}>
//                             <Button onClick={closeModal} style={{ marginRight: '8px' }}>
//                                 Cancel
//                             </Button>
//                             <Button
//                                 type="primary"
//                                 htmlType="submit"
//                                 loading={loading}
//                             >
//                                 {isEditMode ? 'Update Widget' : 'Add Widget'}
//                             </Button>
//                         </div>
//                     </Form>
//                 </Modal>
//             </Content>
//         </Layout>
//     );
// };

// export default DashboardVisualization;



///// working in custom //
import { useState, useEffect, useContext } from 'react';
import GridLayout from 'react-grid-layout';
import { Responsive, WidthProvider } from 'react-grid-layout';
import ReactApexChart from 'react-apexcharts';
import { Modal, Button, Form, Input, Select, InputNumber, Typography, Divider, Card, Layout, Space, message, Cascader, Table, Popconfirm, DatePicker } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, DragOutlined } from '@ant-design/icons';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './DashboardVisualization.css';
import PivotTable from 'react-pivottable/PivotTable';
import 'react-pivottable/pivottable.css';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import utc from 'dayjs/plugin/utc';

dayjs.extend(customParseFormat);
dayjs.extend(utc);

const { Option } = Select;
const { Title } = Typography;
const { Header, Content } = Layout;
const ResponsiveGridLayout = WidthProvider(Responsive);
const { RangePicker } = DatePicker;

const DashboardVisualization = () => {
    const { globalPermissions, token } = useContext(AuthContext);
    const [databaseTables, setDatabaseTables] = useState([]);
    const [tableFields, setTableFields] = useState([]);
    const [loadingFields, setLoadingFields] = useState(false);
    const [selectedTable, setSelectedTable] = useState(null);
    const [widgets, setWidgets] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentWidget, setCurrentWidget] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [nextId, setNextId] = useState(4);
    const [form] = Form.useForm();
    const [selectedTableColumns, setSelectedTableColumns] = useState([]);
    const [layoutChanged, setLayoutChanged] = useState(false);
    const [loading, setLoading] = useState(false);
    const [headers, setHeaders] = useState([]);
    const [chartData, setChartData] = useState({});
    const [tableRawData, setTableRawData] = useState([]);
    const [isDataPopulated, setIsDataPopulated] = useState(false);
    const [selectedDateRange, setSelectedDateRange] = useState([]);
    const [dataSourceType, setDataSourceType] = useState('manual');

    const chartTypes = [
        { value: 'pie', label: 'Pie Chart' },
        { value: 'donut', label: 'Donut Chart' },
        { value: 'bar', label: 'Bar Chart' },
        { value: 'line', label: 'Line Chart' },
        { value: 'area', label: 'Area Chart' },
        { value: 'NormalTable', label: 'Normal Table' },
        { value: 'pivot', label: 'Pivot Table' },
    ];

    const radarTypes = [
        { value: 'radar-standard', label: 'Standard Radar Chart' },
        { value: 'radar-filled', label: 'Filled Radar Chart' },
        { value: 'radar-polar', label: 'Polar Area Chart' },
    ];

    const aggregationOptions = [
        { value: 'sum', label: 'Sum' },
        { value: 'stdDev', label: 'Standard Deviation' },
        { value: 'varPop', label: 'Variance Population' },
        { value: 'max', label: 'Max' },
        { value: 'min', label: 'Min' },
        { value: 'median', label: 'Median' },
        { value: 'mean', label: 'Mean' },
        { value: 'distinct', label: 'Distinct' },
        { value: 'countByValue', label: 'Count by Value' },
        { value: 'count', label: 'Count' },
    ];

    const applyAggregation = (data, aggregationType) => {
        if (!data || !Array.isArray(data) || data.length === 0 || !aggregationType) {
            return data || [];
        }
        const numericData = data.map(val => parseFloat(val)).filter(val => !isNaN(val));
        if (numericData.length === 0) {
            return data;
        }
        switch (aggregationType) {
            case 'sum':
                return parseFloat(numericData.reduce((a, b) => a + b, 0).toFixed(2));
            case 'mean':
                return parseFloat((numericData.reduce((a, b) => a + b, 0) / numericData.length).toFixed(2));
            case 'max':
                return parseFloat(Math.max(...numericData).toFixed(2));
            case 'min':
                return parseFloat(Math.min(...numericData).toFixed(2));
            case 'stdDev': {
                const mean = numericData.reduce((a, b) => a + b, 0) / numericData.length;
                const variance = numericData.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / numericData.length;
                return parseFloat(Math.sqrt(variance).toFixed(2));
            }
            case 'varPop': {
                const mean = numericData.reduce((a, b) => a + b, 0) / numericData.length;
                return parseFloat((numericData.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / numericData.length).toFixed(2));
            }
            case 'median': {
                const sorted = [...numericData].sort((a, b) => a - b);
                const mid = Math.floor(sorted.length / 2);
                const median = sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
                return parseFloat(median.toFixed(2));
            }
            case 'distinct':
                return [...new Set(data)];
            case 'countByValue': {
                const counts = {};
                data.forEach(val => { counts[val] = (counts[val] || 0) + 1; });
                return counts;
            }
            case 'count':
                return data.length;
            default:
                return data;
        }
    };

    useEffect(() => {
        fetchDatabaseTables();
        fetchDashboardWidgets();
    }, []);

    useEffect(() => {
        const maxId = Math.max(...widgets.map((w) => parseInt(w.i) || 0), -1);
        setNextId(maxId + 1);
    }, [widgets]);

    useEffect(() => {
        const fetchDataForWidgets = async () => {
            for (const widget of widgets) {
                if (widget.dataSourceType === 'manual' && widget.tableId && widget.xColumn && widget.yColumns.length > 0 && widget._id) {
                    const { labels, series } = await fetchChartData(widget.tableId, widget.xColumn, widget.yColumns, widget._id);
                    setChartData((prev) => ({
                        ...prev,
                        [widget.i]: { labels, series },
                    }));
                } else if (widget.dataSourceType === 'script' && widget.customScript) {
                    const scriptResult = await executeCustomScript(widget.customScript);
                    setChartData((prev) => ({
                        ...prev,
                        [widget.i]: {
                            labels: scriptResult.labels,
                            series: scriptResult.series,
                        },
                    }));
                }
            }
        };
        fetchDataForWidgets();
    }, [widgets, selectedDateRange]);

    const fetchDatabaseTables = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URI}/api/data/get-all-tables`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response?.data?.data) {
                setDatabaseTables(response.data.data);
            }
        } catch (error) {
            message.error('Failed to load database tables');
            setDatabaseTables([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchDashboardWidgets = async () => {
        setLoading(true);
        try {
            const widgetResponse = await axios.get(`${import.meta.env.VITE_API_URI}/api/data/dynamic_dashboard`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!widgetResponse?.data?.data) {
                setWidgets([]);
                return;
            }

            const fetchedWidgets = Array.isArray(widgetResponse.data.data)
                ? widgetResponse.data.data
                : [widgetResponse.data.data];

            const activeWidgets = fetchedWidgets.filter((widget) => !widget.isDeleted);

            const formattedWidgets = activeWidgets.map((widget) => ({
                _id: widget._id,
                i: widget.i?.toString(),
                title: widget.title,
                yData: widget.yData || [],
                type: widget.type,
                xAxis: widget.xAxis,
                yAxes: Array.isArray(widget.yAxes) ? widget.yAxes : [widget.yAxes],
                labels: Array.isArray(widget.labels) ? widget.labels : JSON.parse(widget.labels || '[]'),
                data: Array.isArray(widget.data) ? widget.data : [JSON.parse(widget.data || '[]')],
                x: widget.x || 0,
                y: widget.y || 0,
                w: widget.w || 4,
                h: widget.h || 3,
                tableId: widget.tableId,
                xColumn: widget.xColumn,
                yColumns: Array.isArray(widget.yColumns) ? widget.yColumns : [widget.yColumns],
                aggregations: widget.aggregations || [],
                created_at: widget.created_at || widget.createdAt,
                updated_at: widget.updated_at,
                dataSourceType: widget.dataSourceType || 'manual',
                customScript: widget.customScript || '',
            }));

            setWidgets(formattedWidgets);
        } catch (error) {
            console.error('Error fetching widgets:', error);
            message.error('Failed to load dashboard widgets');
            setWidgets([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchTableFields = async (tableName) => {
        setLoadingFields(true);
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URI}/api/data/${tableName}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            let allFieldNames = [];
            if (response.data.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
                const responseData = response.data.data;
                setTableRawData(responseData);
                const uniqueFields = new Set();
                responseData.forEach((row) => {
                    Object.keys(row).forEach((key) => uniqueFields.add(key));
                });
                allFieldNames = Array.from(uniqueFields);
                setHeaders(allFieldNames);
            } else {
                setTableRawData([]);
            }

            if (response.data.fields && Array.isArray(response.data.fields)) {
                allFieldNames = response.data.fields.map((field) => field.name);
                setTableFields(response.data.fields);
            } else {
                setTableFields(allFieldNames.map((name) => ({ name })));
            }

            setSelectedTableColumns(allFieldNames);
        } catch (error) {
            console.error('Error fetching table fields:', error);
            message.error('Failed to load table fields');
            setTableFields([]);
            setTableRawData([]);
            setHeaders([]);
            setSelectedTableColumns([]);
        } finally {
            setLoadingFields(false);
        }
    };

    const handleLayoutChange = (layout) => {
        setWidgets(widgets.map((widget) => {
            const layoutItem = layout.find((item) => item.i === widget.i);
            return layoutItem ? { ...widget, x: layoutItem.x, y: layoutItem.y, w: layoutItem.w, h: layoutItem.h } : widget;
        }));
        setLayoutChanged(true);
    };

    const openAddModal = async () => {
        form.resetFields();
        await fetchDatabaseTables();
        const defaultTable = databaseTables.length > 0 ? databaseTables[0] : null;
        let defaultFields = [];
        let defaultData = [];
        let defaultLabels = [];

        if (defaultTable) {
            await fetchTableFields(defaultTable);
            defaultFields = selectedTableColumns.length > 0 ? selectedTableColumns : ['X Axis', 'Y Axis'];
            defaultLabels = tableRawData.length > 0 ? tableRawData.slice(0, 3).map((row) => row[defaultFields[0]] || 'Label') : ['Label 1', 'Label 2', 'Label 3'];
            defaultData = tableRawData.length > 0 ? [tableRawData.slice(0, 3).map((row) => row[defaultFields[1]] || 0)] : [[10, 20, 30]];
        } else {
            defaultFields = ['X Axis', 'Y Axis'];
            defaultLabels = ['Label 1', 'Label 2', 'Label 3'];
            defaultData = [[10, 20, 30]];
        }

        const newWidget = {
            i: nextId.toString(),
            type: '',
            x: 0,
            y: 0,
            w: 3,
            h: 3,
            title: ' ',
            xAxis: defaultFields[0],
            yAxes: defaultFields[1],
            labels: defaultLabels,
            data: defaultData,
            tableId: defaultTable,
            xColumn: defaultFields[0],
            yColumns: defaultFields[1],
            aggregations: [],
            dataSourceType: 'manual',
        };

        setCurrentWidget(newWidget);
        setIsEditMode(false);
        setIsModalOpen(true);
        setDataSourceType('manual');
    };

    const openEditModal = (widget) => {
        setCurrentWidget({ ...widget });
        setIsEditMode(true);
        setIsModalOpen(true);

        if (widget.dataSourceType === 'script') {
            form.setFieldsValue({
                title: widget.title,
                type: widget.type,
                w: widget.w,
                h: widget.h,
                customScript: widget.customScript || '',
                dataSourceType: 'script',
            });
            setDataSourceType('script');
        } else {
            if (widget.tableId) {
                fetchTableFields(widget.tableId);
            } else {
                setSelectedTableColumns([]);
            }
            const yColumnValues = Array.isArray(widget.yColumns) ? widget.yColumns.map(col => [widget.tableId, col]) : [];
            form.setFieldsValue({
                title: widget.title,
                type: widget.type,
                xAxis: widget.xAxis,
                yData: widget.yData,
                labels: Array.isArray(widget.labels) ? widget.labels.join(', ') : '',
                w: widget.w,
                h: widget.h,
                tableAndFields: widget.tableId && widget.xColumn ? [widget.tableId, widget.xColumn] : undefined,
                yColumns: yColumnValues,
                dataSourceType: 'manual',
            });
            setDataSourceType('manual');
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentWidget(null);
    };

    const handleWidgetDelete = async (widgetId) => {
        try {
            setLoading(true);
            const widgetToDelete = widgets.find((w) => w._id === widgetId);
            if (!widgetToDelete) {
                console.error('Widget not found in state for ID:', widgetId);
                message.error('Widget not found');
                return;
            }

            if (widgetToDelete._id) {
                await axios.delete(`${import.meta.env.VITE_API_URI}/api/data/dynamic_dashboard/${widgetToDelete._id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setWidgets((prevWidgets) => prevWidgets.filter((w) => w._id !== widgetId));
                message.success('Widget deleted successfully');
                await fetchDashboardWidgets();
            }
        } catch (error) {
            console.error('Error deleting widget:', error);
            message.error(`Failed to delete widget: ${error.message}`);
        } finally {
            setLoading(false);
            setLayoutChanged(true);
        }
    };

    const updateXLabels = (xField) => {
        if (!tableRawData || !Array.isArray(tableRawData) || tableRawData.length === 0 || !xField) {
            form.setFieldsValue({ labels: '', xAxis: xField || 'X Axis' });
            setIsDataPopulated(false);
            return;
        }
        const uniqueLabels = Array.from(new Set(tableRawData.map((item) => String(item[xField] || '')))).filter((label) => label !== '');
        if (uniqueLabels.every(label => !isNaN(Number(label)))) {
            uniqueLabels.sort((a, b) => Number(a) - Number(b));
        }
        form.setFieldsValue({ labels: uniqueLabels.join(', '), xAxis: xField });
        setIsDataPopulated(true);
    };

    const updateYValues = (yField, index) => {
        if (!tableRawData || !Array.isArray(tableRawData) || tableRawData.length === 0 || !yField) {
            const yData = form.getFieldValue('yData') || [];
            yData[index] = { ...yData[index], data: '', yAxes: yField || 'Y Axis' };
            form.setFieldsValue({ yData });
            setIsDataPopulated(false);
            return;
        }
        const allValues = tableRawData.map((item) => parseFloat(item[yField] || 0).toFixed(2)).filter((value) => value !== '0.00');
        const yData = form.getFieldValue('yData') || [];
        yData[index] = { ...yData[index], data: allValues.join(', '), yAxes: yField };
        form.setFieldsValue({ yData });
        setIsDataPopulated(true);
    };

    const handleDataSourceTypeChange = (value) => {
        setDataSourceType(value);
        form.resetFields(['tableAndFields', 'yData', 'customScript']);
    };

    const executeCustomScript = async (scriptContent) => {
        try {
            const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
            const asyncFunc = new AsyncFunction('axios', 'dayjs', scriptContent);
            const result = await asyncFunc();

            if (!result || typeof result !== 'object' || !Array.isArray(result.labels) || !result.series) {
                throw new Error('Script must return { labels: array, series: array or object }');
            }

            let series = [];
            if (Array.isArray(result.series)) {
                series = result.series.map((s, idx) => ({
                    name: s.name || `Series ${idx + 1}`,
                    data: Array.isArray(s.data) ? s.data.map(val => parseFloat(val) || 0) : [],
                }));
            } else if (typeof result.series === 'object') {
                series = [{
                    name: result.series.name || 'Series 1',
                    data: Array.isArray(result.series.data) ? result.series.data.map(val => parseFloat(val) || 0) : [],
                }];
            }

            return { labels: result.labels, series };
        } catch (error) {
            console.error('Error executing custom script:', error);
            // message.error(`Script execution failed: ${error.message}`);
            return { labels: ['Error'], series: [{ name: 'Error', data: [0] }] };
        }
    };

    const handleFormSubmit = async (values) => {
        try {
            setLoading(true);
            let widgetData;

            if (dataSourceType === 'manual') {
                const { tableAndFields, type, title, w, h, yData } = values;
                const tableId = tableAndFields[0];
                const xColumn = tableAndFields[1];
                const yCols = yData.map((item) => item.yColumns?.[1]).filter(Boolean);
                const aggregations = yData.map((item) => item.aggregation || null);

                widgetData = {
                    i: isEditMode ? currentWidget.i : nextId.toString(),
                    title,
                    type,
                    yData,
                    xAxis: xColumn,
                    yAxes: yCols,
                    x: isEditMode ? currentWidget.x : 0,
                    y: isEditMode ? currentWidget.y : 0,
                    w,
                    h,
                    tableId,
                    xColumn,
                    yColumns: yCols,
                    aggregations,
                    created_at: isEditMode ? currentWidget.created_at : new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    dataSourceType: 'manual',
                };
            } else if (dataSourceType === 'script') {
                const scriptExecutionResult = await executeCustomScript(values.customScript);
                widgetData = {
                    i: isEditMode ? currentWidget.i : nextId.toString(),
                    title: values.title,
                    type: values.type,
                    x: isEditMode ? currentWidget.x : 0,
                    y: isEditMode ? currentWidget.y : 0,
                    w: values.w,
                    h: values.h,
                    labels: scriptExecutionResult.labels,
                    data: scriptExecutionResult.series.map(s => s.data),
                    xAxis: 'Custom Data',
                    yAxes: scriptExecutionResult.series.map(s => s.name),
                    tableId: 'custom_script',
                    xColumn: 'custom_script',
                    yColumns: scriptExecutionResult.series.map(s => s.name),
                    aggregations: [],
                    created_at: isEditMode ? currentWidget.created_at : new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    dataSourceType: 'script',
                    customScript: values.customScript,
                };
                setChartData(prev => ({
                    ...prev,
                    [widgetData.i]: {
                        labels: scriptExecutionResult.labels,
                        series: scriptExecutionResult.series,
                    },
                }));
            }

            if (isEditMode) {
                await axios.put(`${import.meta.env.VITE_API_URI}/api/data/dynamic_dashboard/${currentWidget._id}`, widgetData, {
                    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                });
                setWidgets(prevWidgets =>
                    prevWidgets.map(widget =>
                        widget._id === currentWidget._id ? { ...widgetData, _id: currentWidget._id } : widget
                    )
                );
            } else {
                const response = await axios.post(`${import.meta.env.VITE_API_URI}/api/data/dynamic_dashboard`, widgetData, {
                    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                });
                const newWidget = { ...widgetData, _id: response.data._id || response.data.insertedId };
                setWidgets(prevWidgets => [...prevWidgets, newWidget]);
                setNextId(prev => prev + 1);
            }

            message.success(`Widget ${isEditMode ? 'updated' : 'added'} successfully`);
            closeModal();
        } catch (error) {
            console.error(`Error ${isEditMode ? 'updating' : 'adding'} widget:`, error);
            message.error(`Failed to ${isEditMode ? 'update' : 'add'} widget: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const getChartOptions = (widget, labels) => {
        const baseOptions = {
            chart: {
                id: `chart-${widget.i}`,
                toolbar: { show: true },
                type: widget.type,
            },
            tooltip: { enabled: true },
        };

        if (widget.type === 'pie' || widget.type === 'donut') {
            return {
                ...baseOptions,
                labels,
                legend: { position: 'bottom' },
                chart: { ...baseOptions.chart, type: widget.type === 'donut' ? 'donut' : 'pie' },
                plotOptions: {
                    pie: {
                        donut: { size: '55%', customScale: 0.8 },
                        dataLabels: { offset: 0, minAngleToShowLabel: 10 },
                    },
                },
                dataLabels: {
                    enabled: true,
                    formatter: (val, opts) => opts.w.config.series[opts.dataPointIndex] === 0 ? '0' : opts.w.config.series[opts.dataPointIndex],
                    style: { fontSize: '12px', fontFamily: 'Arial' },
                },
            };
        } else if (widget.type.startsWith('radar')) {
            const radarType = widget.type.split('-')[1] || 'standard';
            const isPolar = radarType === 'polar';
            return {
                ...baseOptions,
                chart: { ...baseOptions.chart, type: 'radar' },
                xaxis: { categories: labels },
                yaxis: {
                    min: 0,
                    forceNiceScale: true,
                    title: { text: widget.yAxes[0] ? `${widget.yAxes[0]}${widget.aggregations[0] ? ` (${widget.aggregations[0]})` : ''}` : '', style: { fontSize: '14px', fontWeight: 'bold' } },
                },
                fill: { opacity: isPolar || radarType === 'filled' ? 0.8 : 0, colors: isPolar || radarType === 'filled' ? ['#FF9800'] : undefined },
                stroke: { show: !isPolar, width: radarType === 'filled' ? 0 : 2, colors: radarType === 'standard' ? ['#F44336'] : undefined },
                markers: { size: radarType === 'standard' ? 4 : 0, colors: ['#F44336'] },
                plotOptions: { radar: { polygons: { strokeColors: '#e8e8e8', fill: { colors: isPolar ? ['rgba(55, 150, 251, 0.85)'] : ['#f8f8f8'] } } } },
                dataLabels: { enabled: true, formatter: val => val === 0 ? '0' : val, style: { fontSize: '12px', fontFamily: 'Arial' } },
            };
        } else {
            const chartSpecificOptions = {
                bar: {
                    plotOptions: { bar: { endingShape: 'rounded' }, states: { hover: { filter: { type: 'none' } } }, grid: { padding: { left: 0, right: 0 } } },
                    dataLabels: { enabled: true, formatter: val => val === 0 ? '0' : val, style: { fontSize: '12px', fontFamily: 'Arial' }, offsetY: -10 },
                },
                line: {
                    stroke: { width: 4, curve: 'smooth', lineCap: 'round' },
                    markers: { size: 5, strokeWidth: 2, hover: { size: 8 } },
                    dataLabels: { enabled: true, formatter: val => val === 0 ? '0' : val },
                },
                area: {
                    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.9, opacityTo: 0.6 } },
                    dataLabels: { enabled: true, formatter: val => val === 0 ? '0' : val },
                },
            };
            const specificOptions = chartSpecificOptions[widget.type] || {};
            return {
                ...baseOptions,
                ...specificOptions,
                chart: { ...baseOptions.chart, type: widget.type },
                xaxis: {
                    categories: labels,
                    labels: { style: { fontSize: '14px', fontWeight: 'bold', fontFamily: 'Arial' }, offsetY: 10 },
                    axisBorder: { show: true },
                    axisTicks: { show: true },
                },
                yaxis: widget.yAxes.map((title, idx) => ({
                    title: { text: `${title}${widget.aggregations[idx] ? ` (${widget.aggregations[idx]})` : ''}`, style: { fontSize: '14px', fontWeight: 'bold' } },
                    min: 0,
                    forceNiceScale: true,
                    opposite: idx % 2 === 1,
                })),
            };
        }
    };

    const fetchChartData = async (tableId, xColumn, yColumns, widgetId) => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URI}/api/data/${tableId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.data.data) return { labels: [], series: [] };

            const currentWidget = widgets.find(w => w._id === widgetId);
            if (!currentWidget) return { labels: [], series: [] };

            const uniqueLabels = [...new Set(response.data.data.map(row => row[xColumn] || ''))];
            const hasDateRange = selectedDateRange.length === 2;
            const startDate = hasDateRange ? dayjs(selectedDateRange[0], 'YYYY-MM-DD').startOf('day') : null;
            const endDate = hasDateRange ? dayjs(selectedDateRange[1], 'YYYY-MM-DD').endOf('day') : null;

            const isPieOrDonut = currentWidget.type === 'pie' || currentWidget.type === 'donut';
            const isRadar = currentWidget.type.startsWith('radar');

            const seriesData = yColumns.map((yCol, index) => {
                const groupedData = uniqueLabels.map(label => {
                    const matchingRecords = response.data.data.filter(row => row[xColumn] === label);
                    if (!hasDateRange) {
                        const aggregationType = currentWidget.aggregations?.[index];
                        if (aggregationType === 'count') return matchingRecords.length;
                        if (aggregationType) {
                            const groupValues = matchingRecords.map(row => parseFloat(row[yCol]) || 0);
                            return applyAggregation(groupValues, aggregationType);
                        }
                        return matchingRecords.length > 0 ? parseFloat(matchingRecords[0][yCol]) || 0 : 0;
                    }

                    const dateMatches = matchingRecords.filter(row => {
                        const dateField = row.created_at || row.createdAt;
                        if (!dateField) return false;
                        const recordDate = dayjs(dateField, 'DD-MM-YYYY HH:mm:ss');
                        return recordDate.isValid() && recordDate.isAfter(startDate) && recordDate.isBefore(endDate);
                    });

                    if (dateMatches.length === 0) return 0;
                    const aggregationType = currentWidget.aggregations?.[index];
                    if (aggregationType === 'count') return dateMatches.length;
                    if (aggregationType) {
                        const groupValues = dateMatches.map(row => parseFloat(row[yCol]) || 0);
                        return applyAggregation(groupValues, aggregationType);
                    }
                    return dateMatches.length > 0 ? parseFloat(dateMatches[0][yCol]) || 0 : 0;
                });

                return {
                    name: `${yCol} ${currentWidget.aggregations[index] ? `(${aggregationOptions.find(opt => opt.value === currentWidget.aggregations[index])?.label})` : ''}`,
                    data: groupedData.map(val => parseFloat(val) || 0),
                };
            });

            let series;
            if (isPieOrDonut) series = seriesData.length > 0 ? seriesData[0].data : [];
            else if (isRadar) series = seriesData;
            else series = seriesData;

            return { labels: uniqueLabels, series };
        } catch (error) {
            console.error('Error fetching chart data:', error);
            message.error('Failed to fetch chart data');
            return { labels: [], series: [] };
        }
    };

    const renderNormalTable = (widget, data) => {
        if (!data || !data.series || !data.labels) return null;
        const normalTableData = data.labels.map((label, index) => {
            const row = { xAxis: label };
            data.series.forEach(series => { row[series.name] = series.data[index]; });
            return row;
        });
        const columns = [
            { title: widget.xAxis || 'Category', dataIndex: 'xAxis', key: 'xAxis', fixed: 'left' },
            ...data.series.map(series => ({
                title: series.name,
                dataIndex: series.name,
                key: series.name,
                sorter: (a, b) => (a[series.name] || 0) - (b[series.name] || 0),
                render: value => typeof value === 'number' ? value.toFixed(2) : value,
            })),
        ];
        return <Table dataSource={normalTableData} columns={columns} scroll={{ x: true }} pagination={false} size="small" bordered style={{ height: '100%', overflow: 'auto' }} />;
    };

    const renderPivot = (widget, data) => {
        if (!data || !data.series || !data.labels) return null;
        const pivotData = data.labels.flatMap((label, index) =>
            data.series.map(series => ({
                [widget.xAxis]: label,
                'Measure': series.name,
                'Value': parseFloat(series.data[index]) || 0,
            }))
        );
        const getAggregatorName = (aggregationType) => {
            switch (aggregationType) {
                case 'sum': return 'Sum';
                case 'mean': return 'Average';
                case 'count': return 'Count';
                case 'min': return 'Minimum';
                case 'max': return 'Maximum';
                case 'countByValue': return 'Count Unique Values';
                default: return 'Sum';
            }
        };
        const selectedAggregation = widget.aggregations?.[0] || 'sum';
        const aggregatorName = getAggregatorName(selectedAggregation);
        const aggregatedData = pivotData.map(item => ({
            ...item,
            'Value': applyAggregation([item['Value']], selectedAggregation),
        }));
        return (
            <div style={{ height: '100%', overflow: 'auto' }}>
                <PivotTable
                    data={aggregatedData}
                    rows={[widget.xAxis]}
                    cols={['Measure']}
                    vals={['Value']}
                    aggregatorName={aggregatorName}
                    rendererName="Table"
                    sorters={{ Value: (a, b) => parseFloat(a) - parseFloat(b) }}
                    unusedOrientationCutoff={Infinity}
                />
            </div>
        );
    };

    const renderChart = (widget) => {
        const { labels, series } = chartData[widget.i] || { labels: widget.labels || [], series: widget.dataSourceType === 'script' ? widget.yAxes.map((name, idx) => ({ name, data: widget.data[idx] || [] })) : [] };
        console.log(`Rendering chart for widget ${widget.i}:`, { labels, series }); // Debug log

        if (!labels.length || !series.length) {
            return <Typography.Text type="secondary">No data available</Typography.Text>;
        }

        if (widget.type === 'pivot') return renderPivot(widget, { labels, series });
        if (widget.type === 'NormalTable') return renderNormalTable(widget, { labels, series });

        const options = getChartOptions(widget, labels);
        let chartSeries = [];
        if (widget.type === 'pie' || widget.type === 'donut') {
            chartSeries = series.length > 0 ? (Array.isArray(series[0].data) ? series[0].data : series).map(val => parseFloat(val) || 0) : [];
        } else if (widget.type.startsWith('radar')) {
            chartSeries = series.map(s => ({ name: s.name, data: s.data.map(val => parseFloat(val) || 0) }));
        } else {
            chartSeries = series.map(s => ({ name: s.name, data: s.data.map(val => parseFloat(val) || 0) }));
        }

        return (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ flex: 1 }}>
                    <ReactApexChart
                        options={{
                            ...options,
                            xaxis: { ...options.xaxis, categories: labels },
                            tooltip: { shared: true, intersect: false },
                            chart: {
                                ...options.chart,
                                animations: { enabled: true },
                                dropShadow: { enabled: true, blur: 3, opacity: 0.2 },
                            },
                        }}
                        series={chartSeries}
                        type={widget.type.startsWith('radar') ? 'radar' : widget.type}
                        height="95%"
                    />
                </div>
                <div style={{ textAlign: 'center', padding: '6px', fontWeight: 'bold', fontSize: '14px' }}>{widget.xAxis}</div>
            </div>
        );
    };

    const renderDataSourceFields = () => (
        <>
            <Form.Item name="dataSourceType" label="Data Source Type" initialValue="manual">
                <Select onChange={handleDataSourceTypeChange}>
                    <Option value="manual">Manually select X-axis & Y-axis values</Option>
                    <Option value="script">Use a custom script</Option>
                </Select>
            </Form.Item>
            {dataSourceType === 'manual' ? (
                <>
                    <Form.Item name="tableAndFields" label="X Axis">
                        <Cascader
                            options={databaseTables.map(table => ({
                                value: table,
                                label: table,
                                children: (headers || []).map(header => ({ value: header, label: header })),
                            }))}
                            placeholder="Select table → X field"
                            onChange={value => {
                                if (value && value.length > 0) {
                                    const tableName = value[0];
                                    setSelectedTable(tableName);
                                    fetchTableFields(tableName);
                                    if (value.length === 2) updateXLabels(value[1]);
                                }
                            }}
                            loadData={async (selectedOptions) => {
                                const targetOption = selectedOptions[0];
                                targetOption.loading = true;
                                await fetchTableFields(targetOption.value);
                                targetOption.loading = false;
                                targetOption.children = headers.map(header => ({ value: header, label: header }));
                                setDatabaseTables([...databaseTables]);
                            }}
                        />
                    </Form.Item>
                    <Form.List name="yData">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name, ...restField }, index) => (
                                    <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                        <Form.Item {...restField} name={[name, 'aggregation']} label={`Aggregation ${index + 1}`}>
                                            <Select placeholder="Select aggregation method" allowClear>
                                                {aggregationOptions.map(option => (
                                                    <Option key={option.value} value={option.value}>{option.label}</Option>
                                                ))}
                                            </Select>
                                        </Form.Item>
                                        <Form.Item {...restField} name={[name, 'yColumns']} label={`Y Axis Field ${index + 1}`}>
                                            <Cascader
                                                options={databaseTables.map(table => ({
                                                    value: table,
                                                    label: table,
                                                    children: (headers || []).map(header => ({ value: header, label: header })),
                                                }))}
                                                placeholder="Select table → Y field"
                                                onChange={value => {
                                                    if (value && value.length > 0) {
                                                        const tableName = value[0];
                                                        setSelectedTable(tableName);
                                                        fetchTableFields(tableName);
                                                        if (value.length === 2) updateYValues(value[1], index);
                                                    }
                                                }}
                                                loadData={async (selectedOptions) => {
                                                    const targetOption = selectedOptions[0];
                                                    targetOption.loading = true;
                                                    await fetchTableFields(targetOption.value);
                                                    targetOption.loading = false;
                                                    targetOption.children = headers.map(header => ({ value: header, label: header }));
                                                    setDatabaseTables([...databaseTables]);
                                                }}
                                            />
                                        </Form.Item>
                                        {fields.length > 1 && <Button onClick={() => remove(name)}>Remove</Button>}
                                    </Space>
                                ))}
                                <Form.Item>
                                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>Add Y Axis</Button>
                                </Form.Item>
                            </>
                        )}
                    </Form.List>
                </>
            ) : (
                <Form.Item name="customScript" label="Custom Script" rules={[{ required: true, message: 'Please enter a custom script' }]}>
                    <Input.TextArea
                        rows={8}
                        placeholder={`Enter JavaScript that returns an object with labels and series:
Example:
  return {
    labels: ['Jan', 'Feb', 'Mar'],
    series: [
        { name: 'Sales', data: [100, 200, 300] },
        { name: 'Expenses', data: [50, 100, 150] }
    ]
}`}
                    />
                </Form.Item>
            )}
        </>
    );

    return (
        <Layout className="dashboard-layout">
            <Header className="dashboard-header">
                <Title level={3} style={{ color: 'white', margin: 0 }}>Dashboard Visualization</Title>
                <Space>
                    <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal}>Add Widget</Button>
                </Space>
            </Header>
            <div style={{ marginBottom: '16px', textAlign: 'right', padding: '20px 24px' }}>
                <RangePicker
                    defaultValue={[dayjs(), dayjs()]}
                    value={selectedDateRange.length === 2 ? [dayjs(selectedDateRange[0]), dayjs(selectedDateRange[1])] : null}
                    onChange={(dates, dateStrings) => {
                        if (!dates || dateStrings.every(date => date === '')) {
                            setSelectedDateRange([]);
                        } else {
                            setSelectedDateRange(dateStrings.map(date => dayjs(date, 'DD-MM-YYYY').format('YYYY-MM-DD')));
                        }
                    }}
                    style={{ width: '250px' }}
                    placeholder={['Start Date', 'End Date']}
                    format="DD-MM-YYYY"
                    allowClear={true}
                />
            </div>
            <Content className="dashboard-content">
                <ResponsiveGridLayout
                    className="layout"
                    layouts={{
                        lg: widgets.map(widget => ({ ...widget, i: widget.i, x: widget.x || 0, y: widget.y || 0, w: widget.w || 4, h: widget.h || 3 })),
                        md: widgets.map(widget => ({ ...widget, i: widget.i, x: widget.x || 0, y: widget.y || 0, w: Math.min(widget.w || 4, 6), h: widget.h || 3 })),
                        sm: widgets.map(widget => ({ ...widget, i: widget.i, x: 0, y: widget.y || 0, w: 12, h: widget.h || 3 })),
                        xs: widgets.map(widget => ({ ...widget, i: widget.i, x: 0, y: widget.y || 0, w: 12, h: widget.h || 3 })),
                    }}
                    breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
                    cols={{ lg: 12, md: 6, sm: 12, xs: 12 }}
                    rowHeight={100}
                    margin={[10, 10]}
                    containerPadding={[15, 15]}
                    onLayoutChange={handleLayoutChange}
                    draggableHandle=".drag-handle"
                    isResizable={true}
                    isDraggable={true}
                    style={{ minHeight: '100vh' }}
                >
                    {widgets.map((widget) => (
                        <div key={widget.i} className="widget-container">
                            <Card
                                title={<div className="drag-handle"><DragOutlined className="drag-icon" /> {widget.title}</div>}
                                extra={
                                    <Space>
                                        <Button type="text" icon={<EditOutlined />} onClick={() => openEditModal(widget)} className="edit-button" />
                                        <Popconfirm
                                            title="Are you sure you want to delete this widget?"
                                            description="This action cannot be undone."
                                            onConfirm={() => handleWidgetDelete(widget._id)}
                                            okText="Yes"
                                            cancelText="No"
                                            placement="topRight"
                                        >
                                            <Button type="text" icon={<DeleteOutlined />} className="delete-button" />
                                        </Popconfirm>
                                    </Space>
                                }
                                bordered={true}
                                className="widget-card"
                                style={{ height: '100%' }}
                            >
                                <div className="widget-content">
                                    {renderChart(widget)}
                                </div>
                                {widget.tableId && (
                                    <div className="widget-data-source">
                                        <Typography.Text type="secondary">
                                            Data source: {widget.tableId} ({widget.xColumn} → {widget.yColumns.join(', ')})
                                            {widget.aggregations.some(agg => agg) ? ` [${widget.aggregations.filter(agg => agg).join(', ')}]` : ''}
                                        </Typography.Text>
                                    </div>
                                )}
                            </Card>
                        </div>
                    ))}
                </ResponsiveGridLayout>
                <Modal
                    title={isEditMode ? 'Edit Widget' : 'Add New Widget'}
                    open={isModalOpen}
                    onCancel={closeModal}
                    footer={null}
                    width={700}
                    confirmLoading={loading}
                >
                    <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
                        <Form.Item name="title" label="Widget Title" rules={[{ required: true, message: 'Please enter a widget title' }]}>
                            <Input placeholder="Enter widget title" />
                        </Form.Item>
                        <Form.Item name="type" label="Chart Type" rules={[{ required: true, message: 'Please select a chart type' }]}>
                            <Select placeholder="Select chart type">
                                {chartTypes.map(type => <Option key={type.value} value={type.value}>{type.label}</Option>)}
                                <Select.OptGroup label="Radar Charts">
                                    {radarTypes.map(type => <Option key={type.value} value={type.value}>{type.label}</Option>)}
                                </Select.OptGroup>
                            </Select>
                        </Form.Item>
                        <Divider>Data Source</Divider>
                        {renderDataSourceFields()}
                        <Divider>Widget Size</Divider>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <Form.Item name="w" label="Width (columns)" rules={[{ required: true, message: 'Please enter width' }]} style={{ flex: 1 }}>
                                <InputNumber min={1} max={12} style={{ width: '100%' }} />
                            </Form.Item>
                            <Form.Item name="h" label="Height (rows)" rules={[{ required: true, message: 'Please enter height' }]} style={{ flex: 1 }}>
                                <InputNumber min={1} max={6} style={{ width: '100%' }} />
                            </Form.Item>
                        </div>
                        <div className="form-actions" style={{ marginTop: '16px', textAlign: 'right' }}>
                            <Button onClick={closeModal} style={{ marginRight: '8px' }}>Cancel</Button>
                            <Button type="primary" htmlType="submit" loading={loading}>{isEditMode ? 'Update Widget' : 'Add Widget'}</Button>
                        </div>
                    </Form>
                </Modal>
            </Content>
        </Layout>
    );
};

export default DashboardVisualization;




//// infooutlined///
// import { useState, useEffect, useContext } from 'react';
// import GridLayout from 'react-grid-layout';
// import { Responsive, WidthProvider } from 'react-grid-layout';
// import ReactApexChart from 'react-apexcharts';
// import { Modal, Button, Form, Input, Select, InputNumber, Typography, Divider, Card, Layout, Space, message, Cascader, Table, Popconfirm, DatePicker , Tooltip} from 'antd';
// import { PlusOutlined, EditOutlined, DeleteOutlined, DragOutlined,InfoOutlined } from '@ant-design/icons';
// import axios from 'axios';
// import { AuthContext } from '../../context/AuthContext';
// import 'react-grid-layout/css/styles.css';
// import 'react-resizable/css/styles.css';
// import './DashboardVisualization.css';
// import PivotTable from 'react-pivottable/PivotTable';
// import 'react-pivottable/pivottable.css';
// import dayjs from 'dayjs';
// import customParseFormat from 'dayjs/plugin/customParseFormat';
// import utc from 'dayjs/plugin/utc';

// dayjs.extend(customParseFormat);
// dayjs.extend(utc);

// const { Option } = Select;
// const { Title } = Typography;
// const { Header, Content } = Layout;
// const ResponsiveGridLayout = WidthProvider(Responsive);
// const { RangePicker } = DatePicker;

// const DashboardVisualization = () => {
//     const { globalPermissions, token } = useContext(AuthContext);
//     const [databaseTables, setDatabaseTables] = useState([]);
//     const [tableFields, setTableFields] = useState([]);
//     const [loadingFields, setLoadingFields] = useState(false);
//     const [selectedTable, setSelectedTable] = useState(null);
//     const [widgets, setWidgets] = useState([]);
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [currentWidget, setCurrentWidget] = useState(null);
//     const [isEditMode, setIsEditMode] = useState(false);
//     const [nextId, setNextId] = useState(4);
//     const [form] = Form.useForm();
//     const [selectedTableColumns, setSelectedTableColumns] = useState([]);
//     const [layoutChanged, setLayoutChanged] = useState(false);
//     const [loading, setLoading] = useState(false);
//     const [headers, setHeaders] = useState([]);
//     const [chartData, setChartData] = useState({});
//     const [tableRawData, setTableRawData] = useState([]);
//     const [isDataPopulated, setIsDataPopulated] = useState(false);
//     const [selectedDateRange, setSelectedDateRange] = useState([]);
//     const [dataSourceType, setDataSourceType] = useState('manual');
//     const [isSchemaModalOpen, setIsSchemaModalOpen] = useState(false);


//     const chartTypes = [
//         { value: 'pie', label: 'Pie Chart' },
//         { value: 'donut', label: 'Donut Chart' },
//         { value: 'bar', label: 'Bar Chart' },
//         { value: 'line', label: 'Line Chart' },
//         { value: 'area', label: 'Area Chart' },
//         { value: 'NormalTable', label: 'Normal Table' },
//         { value: 'pivot', label: 'Pivot Table' },
//     ];

//     const radarTypes = [
//         { value: 'radar-standard', label: 'Standard Radar Chart' },
//         { value: 'radar-filled', label: 'Filled Radar Chart' },
//         { value: 'radar-polar', label: 'Polar Area Chart' },
//     ];

//     const aggregationOptions = [
//         { value: 'sum', label: 'Sum' },
//         { value: 'stdDev', label: 'Standard Deviation' },
//         { value: 'varPop', label: 'Variance Population' },
//         { value: 'max', label: 'Max' },
//         { value: 'min', label: 'Min' },
//         { value: 'median', label: 'Median' },
//         { value: 'mean', label: 'Mean' },
//         { value: 'distinct', label: 'Distinct' },
//         { value: 'countByValue', label: 'Count by Value' },
//         { value: 'count', label: 'Count' },
//     ];

//     const applyAggregation = (data, aggregationType) => {
//         if (!data || !Array.isArray(data) || data.length === 0 || !aggregationType) {
//             return data || [];
//         }
//         const numericData = data.map(val => parseFloat(val)).filter(val => !isNaN(val));
//         if (numericData.length === 0) {
//             return data;
//         }
//         switch (aggregationType) {
//             case 'sum':
//                 return parseFloat(numericData.reduce((a, b) => a + b, 0).toFixed(2));
//             case 'mean':
//                 return parseFloat((numericData.reduce((a, b) => a + b, 0) / numericData.length).toFixed(2));
//             case 'max':
//                 return parseFloat(Math.max(...numericData).toFixed(2));
//             case 'min':
//                 return parseFloat(Math.min(...numericData).toFixed(2));
//             case 'stdDev': {
//                 const mean = numericData.reduce((a, b) => a + b, 0) / numericData.length;
//                 const variance = numericData.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / numericData.length;
//                 return parseFloat(Math.sqrt(variance).toFixed(2));
//             }
//             case 'varPop': {
//                 const mean = numericData.reduce((a, b) => a + b, 0) / numericData.length;
//                 return parseFloat((numericData.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / numericData.length).toFixed(2));
//             }
//             case 'median': {
//                 const sorted = [...numericData].sort((a, b) => a - b);
//                 const mid = Math.floor(sorted.length / 2);
//                 const median = sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
//                 return parseFloat(median.toFixed(2));
//             }
//             case 'distinct':
//                 return [...new Set(data)];
//             case 'countByValue': {
//                 const counts = {};
//                 data.forEach(val => { counts[val] = (counts[val] || 0) + 1; });
//                 return counts;
//             }
//             case 'count':
//                 return data.length;
//             default:
//                 return data;
//         }
//     };

//     useEffect(() => {
//         fetchDatabaseTables();
//         fetchDashboardWidgets();
//     }, []);

//     useEffect(() => {
//         const maxId = Math.max(...widgets.map((w) => parseInt(w.i) || 0), -1);
//         setNextId(maxId + 1);
//     }, [widgets]);

//     useEffect(() => {
//         const fetchDataForWidgets = async () => {
//             for (const widget of widgets) {
//                 if (widget.dataSourceType === 'manual' && widget.tableId && widget.xColumn && widget.yColumns.length > 0 && widget._id) {
//                     const { labels, series } = await fetchChartData(widget.tableId, widget.xColumn, widget.yColumns, widget._id);
//                     setChartData((prev) => ({
//                         ...prev,
//                         [widget.i]: { labels, series },
//                     }));
//                 } else if (widget.dataSourceType === 'script' && widget.customScript) {
//                     const scriptResult = await executeCustomScript(widget.customScript);
//                     setChartData((prev) => ({
//                         ...prev,
//                         [widget.i]: {
//                             labels: scriptResult.labels,
//                             series: scriptResult.series,
//                         },
//                     }));
//                 }
//             }
//         };
//         fetchDataForWidgets();
//     }, [widgets, selectedDateRange]);

//     const fetchDatabaseTables = async () => {
//         setLoading(true);
//         try {
//             const response = await axios.get(`${import.meta.env.VITE_API_URI}/api/data/get-all-tables`, {
//                 headers: { Authorization: `Bearer ${token}` },
//             });
//             if (response?.data?.data) {
//                 setDatabaseTables(response.data.data);
//             }
//         } catch (error) {
//             message.error('Failed to load database tables');
//             setDatabaseTables([]);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const fetchDashboardWidgets = async () => {
//         setLoading(true);
//         try {
//             const widgetResponse = await axios.get(`${import.meta.env.VITE_API_URI}/api/data/dynamic_dashboard`, {
//                 headers: { Authorization: `Bearer ${token}` },
//             });

//             if (!widgetResponse?.data?.data) {
//                 setWidgets([]);
//                 return;
//             }

//             const fetchedWidgets = Array.isArray(widgetResponse.data.data)
//                 ? widgetResponse.data.data
//                 : [widgetResponse.data.data];

//             const activeWidgets = fetchedWidgets.filter((widget) => !widget.isDeleted);

//             const formattedWidgets = activeWidgets.map((widget) => ({
//                 _id: widget._id,
//                 i: widget.i?.toString(),
//                 title: widget.title,
//                 yData: widget.yData || [],
//                 type: widget.type,
//                 xAxis: widget.xAxis,
//                 yAxes: Array.isArray(widget.yAxes) ? widget.yAxes : [widget.yAxes],
//                 labels: Array.isArray(widget.labels) ? widget.labels : JSON.parse(widget.labels || '[]'),
//                 data: Array.isArray(widget.data) ? widget.data : [JSON.parse(widget.data || '[]')],
//                 x: widget.x || 0,
//                 y: widget.y || 0,
//                 w: widget.w || 4,
//                 h: widget.h || 3,
//                 tableId: widget.tableId,
//                 xColumn: widget.xColumn,
//                 yColumns: Array.isArray(widget.yColumns) ? widget.yColumns : [widget.yColumns],
//                 aggregations: widget.aggregations || [],
//                 created_at: widget.created_at || widget.createdAt,
//                 updated_at: widget.updated_at,
//                 dataSourceType: widget.dataSourceType || 'manual',
//                 customScript: widget.customScript || '',
//             }));

//             setWidgets(formattedWidgets);
//         } catch (error) {
//             console.error('Error fetching widgets:', error);
//             message.error('Failed to load dashboard widgets');
//             setWidgets([]);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const fetchTableFields = async (tableName) => {
//         setLoadingFields(true);
//         try {
//             const response = await axios.get(`${import.meta.env.VITE_API_URI}/api/data/${tableName}`, {
//                 headers: { Authorization: `Bearer ${token}` },
//             });

//             let allFieldNames = [];
//             if (response.data.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
//                 const responseData = response.data.data;
//                 setTableRawData(responseData);
//                 const uniqueFields = new Set();
//                 responseData.forEach((row) => {
//                     Object.keys(row).forEach((key) => uniqueFields.add(key));
//                 });
//                 allFieldNames = Array.from(uniqueFields);
//                 setHeaders(allFieldNames);
//             } else {
//                 setTableRawData([]);
//             }

//             if (response.data.fields && Array.isArray(response.data.fields)) {
//                 allFieldNames = response.data.fields.map((field) => field.name);
//                 setTableFields(response.data.fields);
//             } else {
//                 setTableFields(allFieldNames.map((name) => ({ name })));
//             }

//             setSelectedTableColumns(allFieldNames);
//         } catch (error) {
//             console.error('Error fetching table fields:', error);
//             message.error('Failed to load table fields');
//             setTableFields([]);
//             setTableRawData([]);
//             setHeaders([]);
//             setSelectedTableColumns([]);
//         } finally {
//             setLoadingFields(false);
//         }
//     };

//     const handleLayoutChange = (layout) => {
//         setWidgets(widgets.map((widget) => {
//             const layoutItem = layout.find((item) => item.i === widget.i);
//             return layoutItem ? { ...widget, x: layoutItem.x, y: layoutItem.y, w: layoutItem.w, h: layoutItem.h } : widget;
//         }));
//         setLayoutChanged(true);
//     };

//     const openAddModal = async () => {
//         form.resetFields();
//         await fetchDatabaseTables();
//         const defaultTable = databaseTables.length > 0 ? databaseTables[0] : null;
//         let defaultFields = [];
//         let defaultData = [];
//         let defaultLabels = [];

//         if (defaultTable) {
//             await fetchTableFields(defaultTable);
//             defaultFields = selectedTableColumns.length > 0 ? selectedTableColumns : ['X Axis', 'Y Axis'];
//             defaultLabels = tableRawData.length > 0 ? tableRawData.slice(0, 3).map((row) => row[defaultFields[0]] || 'Label') : ['Label 1', 'Label 2', 'Label 3'];
//             defaultData = tableRawData.length > 0 ? [tableRawData.slice(0, 3).map((row) => row[defaultFields[1]] || 0)] : [[10, 20, 30]];
//         } else {
//             defaultFields = ['X Axis', 'Y Axis'];
//             defaultLabels = ['Label 1', 'Label 2', 'Label 3'];
//             defaultData = [[10, 20, 30]];
//         }

//         const newWidget = {
//             i: nextId.toString(),
//             type: '',
//             x: 0,
//             y: 0,
//             w: 3,
//             h: 3,
//             title: ' ',
//             xAxis: defaultFields[0],
//             yAxes: defaultFields[1],
//             labels: defaultLabels,
//             data: defaultData,
//             tableId: defaultTable,
//             xColumn: defaultFields[0],
//             yColumns: defaultFields[1],
//             aggregations: [],
//             dataSourceType: 'manual',
//         };

//         setCurrentWidget(newWidget);
//         setIsEditMode(false);
//         setIsModalOpen(true);
//         setDataSourceType('manual');
//     };

//     const openEditModal = (widget) => {
//         setCurrentWidget({ ...widget });
//         setIsEditMode(true);
//         setIsModalOpen(true);

//         if (widget.dataSourceType === 'script') {
//             form.setFieldsValue({
//                 title: widget.title,
//                 type: widget.type,
//                 w: widget.w,
//                 h: widget.h,
//                 customScript: widget.customScript || '',
//                 dataSourceType: 'script',
//             });
//             setDataSourceType('script');
//         } else {
//             if (widget.tableId) {
//                 fetchTableFields(widget.tableId);
//             } else {
//                 setSelectedTableColumns([]);
//             }
//             const yColumnValues = Array.isArray(widget.yColumns) ? widget.yColumns.map(col => [widget.tableId, col]) : [];
//             form.setFieldsValue({
//                 title: widget.title,
//                 type: widget.type,
//                 xAxis: widget.xAxis,
//                 yData: widget.yData,
//                 labels: Array.isArray(widget.labels) ? widget.labels.join(', ') : '',
//                 w: widget.w,
//                 h: widget.h,
//                 tableAndFields: widget.tableId && widget.xColumn ? [widget.tableId, widget.xColumn] : undefined,
//                 yColumns: yColumnValues,
//                 dataSourceType: 'manual',
//             });
//             setDataSourceType('manual');
//         }
//     };

//     const closeModal = () => {
//         setIsModalOpen(false);
//         setCurrentWidget(null);
//     };

//     const handleWidgetDelete = async (widgetId) => {
//         try {
//             setLoading(true);
//             const widgetToDelete = widgets.find((w) => w._id === widgetId);
//             if (!widgetToDelete) {
//                 console.error('Widget not found in state for ID:', widgetId);
//                 message.error('Widget not found');
//                 return;
//             }

//             if (widgetToDelete._id) {
//                 await axios.delete(`${import.meta.env.VITE_API_URI}/api/data/dynamic_dashboard/${widgetToDelete._id}`, {
//                     headers: { Authorization: `Bearer ${token}` },
//                 });
//                 setWidgets((prevWidgets) => prevWidgets.filter((w) => w._id !== widgetId));
//                 message.success('Widget deleted successfully');
//                 await fetchDashboardWidgets();
//             }
//         } catch (error) {
//             console.error('Error deleting widget:', error);
//             message.error(`Failed to delete widget: ${error.message}`);
//         } finally {
//             setLoading(false);
//             setLayoutChanged(true);
//         }
//     };

//     const updateXLabels = (xField) => {
//         if (!tableRawData || !Array.isArray(tableRawData) || tableRawData.length === 0 || !xField) {
//             form.setFieldsValue({ labels: '', xAxis: xField || 'X Axis' });
//             setIsDataPopulated(false);
//             return;
//         }
//         const uniqueLabels = Array.from(new Set(tableRawData.map((item) => String(item[xField] || '')))).filter((label) => label !== '');
//         if (uniqueLabels.every(label => !isNaN(Number(label)))) {
//             uniqueLabels.sort((a, b) => Number(a) - Number(b));
//         }
//         form.setFieldsValue({ labels: uniqueLabels.join(', '), xAxis: xField });
//         setIsDataPopulated(true);
//     };

//     const updateYValues = (yField, index) => {
//         if (!tableRawData || !Array.isArray(tableRawData) || tableRawData.length === 0 || !yField) {
//             const yData = form.getFieldValue('yData') || [];
//             yData[index] = { ...yData[index], data: '', yAxes: yField || 'Y Axis' };
//             form.setFieldsValue({ yData });
//             setIsDataPopulated(false);
//             return;
//         }
//         const allValues = tableRawData.map((item) => parseFloat(item[yField] || 0).toFixed(2)).filter((value) => value !== '0.00');
//         const yData = form.getFieldValue('yData') || [];
//         yData[index] = { ...yData[index], data: allValues.join(', '), yAxes: yField };
//         form.setFieldsValue({ yData });
//         setIsDataPopulated(true);
//     };

//     const handleDataSourceTypeChange = (value) => {
//         setDataSourceType(value);
//         form.resetFields(['tableAndFields', 'yData', 'customScript']);
//     };

//     const executeCustomScript = async (scriptContent) => {
//         try {
//             const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
//             const asyncFunc = new AsyncFunction('axios', 'dayjs', scriptContent);
//             const result = await asyncFunc();

//             if (!result || typeof result !== 'object' || !Array.isArray(result.labels) || !result.series) {
//                 throw new Error('Script must return { labels: array, series: array or object }');
//             }

//             let series = [];
//             if (Array.isArray(result.series)) {
//                 series = result.series.map((s, idx) => ({
//                     name: s.name || `Series ${idx + 1}`,
//                     data: Array.isArray(s.data) ? s.data.map(val => parseFloat(val) || 0) : [],
//                 }));
//             } else if (typeof result.series === 'object') {
//                 series = [{
//                     name: result.series.name || 'Series 1',
//                     data: Array.isArray(result.series.data) ? result.series.data.map(val => parseFloat(val) || 0) : [],
//                 }];
//             }

//             return { labels: result.labels, series };
//         } catch (error) {
//             console.error('Error executing custom script:', error);
//             message.error(`Script execution failed: ${error.message}`);
//             return { labels: ['Error'], series: [{ name: 'Error', data: [0] }] };
//         }
//     };

//     const handleFormSubmit = async (values) => {
//         try {
//             setLoading(true);
//             let widgetData;

//             if (dataSourceType === 'manual') {
//                 const { tableAndFields, type, title, w, h, yData } = values;
//                 const tableId = tableAndFields[0];
//                 const xColumn = tableAndFields[1];
//                 const yCols = yData.map((item) => item.yColumns?.[1]).filter(Boolean);
//                 const aggregations = yData.map((item) => item.aggregation || null);

//                 widgetData = {
//                     i: isEditMode ? currentWidget.i : nextId.toString(),
//                     title,
//                     type,
//                     yData,
//                     xAxis: xColumn,
//                     yAxes: yCols,
//                     x: isEditMode ? currentWidget.x : 0,
//                     y: isEditMode ? currentWidget.y : 0,
//                     w,
//                     h,
//                     tableId,
//                     xColumn,
//                     yColumns: yCols,
//                     aggregations,
//                     created_at: isEditMode ? currentWidget.created_at : new Date().toISOString(),
//                     updated_at: new Date().toISOString(),
//                     dataSourceType: 'manual',
//                 };
//             } else if (dataSourceType === 'script') {
//                 const scriptExecutionResult = await executeCustomScript(values.customScript);
//                 widgetData = {
//                     i: isEditMode ? currentWidget.i : nextId.toString(),
//                     title: values.title,
//                     type: values.type,
//                     x: isEditMode ? currentWidget.x : 0,
//                     y: isEditMode ? currentWidget.y : 0,
//                     w: values.w,
//                     h: values.h,
//                     labels: scriptExecutionResult.labels,
//                     data: scriptExecutionResult.series.map(s => s.data),
//                     xAxis: 'Custom Data',
//                     yAxes: scriptExecutionResult.series.map(s => s.name),
//                     tableId: 'custom_script',
//                     xColumn: 'custom_script',
//                     yColumns: scriptExecutionResult.series.map(s => s.name),
//                     aggregations: [],
//                     created_at: isEditMode ? currentWidget.created_at : new Date().toISOString(),
//                     updated_at: new Date().toISOString(),
//                     dataSourceType: 'script',
//                     customScript: values.customScript,
//                 };
//                 setChartData(prev => ({
//                     ...prev,
//                     [widgetData.i]: {
//                         labels: scriptExecutionResult.labels,
//                         series: scriptExecutionResult.series,
//                     },
//                 }));
//             }

//             if (isEditMode) {
//                 await axios.put(`${import.meta.env.VITE_API_URI}/api/data/dynamic_dashboard/${currentWidget._id}`, widgetData, {
//                     headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
//                 });
//                 setWidgets(prevWidgets =>
//                     prevWidgets.map(widget =>
//                         widget._id === currentWidget._id ? { ...widgetData, _id: currentWidget._id } : widget
//                     )
//                 );
//             } else {
//                 const response = await axios.post(`${import.meta.env.VITE_API_URI}/api/data/dynamic_dashboard`, widgetData, {
//                     headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
//                 });
//                 const newWidget = { ...widgetData, _id: response.data._id || response.data.insertedId };
//                 setWidgets(prevWidgets => [...prevWidgets, newWidget]);
//                 setNextId(prev => prev + 1);
//             }

//             message.success(`Widget ${isEditMode ? 'updated' : 'added'} successfully`);
//             closeModal();
//         } catch (error) {
//             console.error(`Error ${isEditMode ? 'updating' : 'adding'} widget:`, error);
//             message.error(`Failed to ${isEditMode ? 'update' : 'add'} widget: ${error.message}`);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const getChartOptions = (widget, labels) => {
//         const baseOptions = {
//             chart: {
//                 id: `chart-${widget.i}`,
//                 toolbar: { show: true },
//                 type: widget.type,
//             },
//             tooltip: { enabled: true },
//         };

//         if (widget.type === 'pie' || widget.type === 'donut') {
//             return {
//                 ...baseOptions,
//                 labels,
//                 legend: { position: 'bottom' },
//                 chart: { ...baseOptions.chart, type: widget.type === 'donut' ? 'donut' : 'pie' },
//                 plotOptions: {
//                     pie: {
//                         donut: { size: '55%', customScale: 0.8 },
//                         dataLabels: { offset: 0, minAngleToShowLabel: 10 },
//                     },
//                 },
//                 dataLabels: {
//                     enabled: true,
//                     formatter: (val, opts) => opts.w.config.series[opts.dataPointIndex] === 0 ? '0' : opts.w.config.series[opts.dataPointIndex],
//                     style: { fontSize: '12px', fontFamily: 'Arial' },
//                 },
//             };
//         } else if (widget.type.startsWith('radar')) {
//             const radarType = widget.type.split('-')[1] || 'standard';
//             const isPolar = radarType === 'polar';
//             return {
//                 ...baseOptions,
//                 chart: { ...baseOptions.chart, type: 'radar' },
//                 xaxis: { categories: labels },
//                 yaxis: {
//                     min: 0,
//                     forceNiceScale: true,
//                     title: { text: widget.yAxes[0] ? `${widget.yAxes[0]}${widget.aggregations[0] ? ` (${widget.aggregations[0]})` : ''}` : '', style: { fontSize: '14px', fontWeight: 'bold' } },
//                 },
//                 fill: { opacity: isPolar || radarType === 'filled' ? 0.8 : 0, colors: isPolar || radarType === 'filled' ? ['#FF9800'] : undefined },
//                 stroke: { show: !isPolar, width: radarType === 'filled' ? 0 : 2, colors: radarType === 'standard' ? ['#F44336'] : undefined },
//                 markers: { size: radarType === 'standard' ? 4 : 0, colors: ['#F44336'] },
//                 plotOptions: { radar: { polygons: { strokeColors: '#e8e8e8', fill: { colors: isPolar ? ['rgba(55, 150, 251, 0.85)'] : ['#f8f8f8'] } } } },
//                 dataLabels: { enabled: true, formatter: val => val === 0 ? '0' : val, style: { fontSize: '12px', fontFamily: 'Arial' } },
//             };
//         } else {
//             const chartSpecificOptions = {
//                 bar: {
//                     plotOptions: { bar: { endingShape: 'rounded' }, states: { hover: { filter: { type: 'none' } } }, grid: { padding: { left: 0, right: 0 } } },
//                     dataLabels: { enabled: true, formatter: val => val === 0 ? '0' : val, style: { fontSize: '12px', fontFamily: 'Arial' }, offsetY: -10 },
//                 },
//                 line: {
//                     stroke: { width: 4, curve: 'smooth', lineCap: 'round' },
//                     markers: { size: 5, strokeWidth: 2, hover: { size: 8 } },
//                     dataLabels: { enabled: true, formatter: val => val === 0 ? '0' : val },
//                 },
//                 area: {
//                     fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.9, opacityTo: 0.6 } },
//                     dataLabels: { enabled: true, formatter: val => val === 0 ? '0' : val },
//                 },
//             };
//             const specificOptions = chartSpecificOptions[widget.type] || {};
//             return {
//                 ...baseOptions,
//                 ...specificOptions,
//                 chart: { ...baseOptions.chart, type: widget.type },
//                 xaxis: {
//                     categories: labels,
//                     labels: { style: { fontSize: '14px', fontWeight: 'bold', fontFamily: 'Arial' }, offsetY: 10 },
//                     axisBorder: { show: true },
//                     axisTicks: { show: true },
//                 },
//                 yaxis: widget.yAxes.map((title, idx) => ({
//                     title: { text: `${title}${widget.aggregations[idx] ? ` (${widget.aggregations[idx]})` : ''}`, style: { fontSize: '14px', fontWeight: 'bold' } },
//                     min: 0,
//                     forceNiceScale: true,
//                     opposite: idx % 2 === 1,
//                 })),
//             };
//         }
//     };

//     const fetchChartData = async (tableId, xColumn, yColumns, widgetId) => {
//         try {
//             const response = await axios.get(`${import.meta.env.VITE_API_URI}/api/data/${tableId}`, {
//                 headers: { Authorization: `Bearer ${token}` },
//             });

//             if (!response.data.data) return { labels: [], series: [] };

//             const currentWidget = widgets.find(w => w._id === widgetId);
//             if (!currentWidget) return { labels: [], series: [] };

//             const uniqueLabels = [...new Set(response.data.data.map(row => row[xColumn] || ''))];
//             const hasDateRange = selectedDateRange.length === 2;
//             const startDate = hasDateRange ? dayjs(selectedDateRange[0], 'YYYY-MM-DD').startOf('day') : null;
//             const endDate = hasDateRange ? dayjs(selectedDateRange[1], 'YYYY-MM-DD').endOf('day') : null;

//             const isPieOrDonut = currentWidget.type === 'pie' || currentWidget.type === 'donut';
//             const isRadar = currentWidget.type.startsWith('radar');

//             const seriesData = yColumns.map((yCol, index) => {
//                 const groupedData = uniqueLabels.map(label => {
//                     const matchingRecords = response.data.data.filter(row => row[xColumn] === label);
//                     if (!hasDateRange) {
//                         const aggregationType = currentWidget.aggregations?.[index];
//                         if (aggregationType === 'count') return matchingRecords.length;
//                         if (aggregationType) {
//                             const groupValues = matchingRecords.map(row => parseFloat(row[yCol]) || 0);
//                             return applyAggregation(groupValues, aggregationType);
//                         }
//                         return matchingRecords.length > 0 ? parseFloat(matchingRecords[0][yCol]) || 0 : 0;
//                     }

//                     const dateMatches = matchingRecords.filter(row => {
//                         const dateField = row.created_at || row.createdAt;
//                         if (!dateField) return false;
//                         const recordDate = dayjs(dateField, 'DD-MM-YYYY HH:mm:ss');
//                         return recordDate.isValid() && recordDate.isAfter(startDate) && recordDate.isBefore(endDate);
//                     });

//                     if (dateMatches.length === 0) return 0;
//                     const aggregationType = currentWidget.aggregations?.[index];
//                     if (aggregationType === 'count') return dateMatches.length;
//                     if (aggregationType) {
//                         const groupValues = dateMatches.map(row => parseFloat(row[yCol]) || 0);
//                         return applyAggregation(groupValues, aggregationType);
//                     }
//                     return dateMatches.length > 0 ? parseFloat(dateMatches[0][yCol]) || 0 : 0;
//                 });

//                 return {
//                     name: `${yCol} ${currentWidget.aggregations[index] ? `(${aggregationOptions.find(opt => opt.value === currentWidget.aggregations[index])?.label})` : ''}`,
//                     data: groupedData.map(val => parseFloat(val) || 0),
//                 };
//             });

//             let series;
//             if (isPieOrDonut) series = seriesData.length > 0 ? seriesData[0].data : [];
//             else if (isRadar) series = seriesData;
//             else series = seriesData;

//             return { labels: uniqueLabels, series };
//         } catch (error) {
//             console.error('Error fetching chart data:', error);
//             message.error('Failed to fetch chart data');
//             return { labels: [], series: [] };
//         }
//     };

//     const renderNormalTable = (widget, data) => {
//         if (!data || !data.series || !data.labels) return null;
//         const normalTableData = data.labels.map((label, index) => {
//             const row = { xAxis: label };
//             data.series.forEach(series => { row[series.name] = series.data[index]; });
//             return row;
//         });
//         const columns = [
//             { title: widget.xAxis || 'Category', dataIndex: 'xAxis', key: 'xAxis', fixed: 'left' },
//             ...data.series.map(series => ({
//                 title: series.name,
//                 dataIndex: series.name,
//                 key: series.name,
//                 sorter: (a, b) => (a[series.name] || 0) - (b[series.name] || 0),
//                 render: value => typeof value === 'number' ? value.toFixed(2) : value,
//             })),
//         ];
//         return <Table dataSource={normalTableData} columns={columns} scroll={{ x: true }} pagination={false} size="small" bordered style={{ height: '100%', overflow: 'auto' }} />;
//     };

//     const renderPivot = (widget, data) => {
//         if (!data || !data.series || !data.labels) return null;
//         const pivotData = data.labels.flatMap((label, index) =>
//             data.series.map(series => ({
//                 [widget.xAxis]: label,
//                 'Measure': series.name,
//                 'Value': parseFloat(series.data[index]) || 0,
//             }))
//         );
//         const getAggregatorName = (aggregationType) => {
//             switch (aggregationType) {
//                 case 'sum': return 'Sum';
//                 case 'mean': return 'Average';
//                 case 'count': return 'Count';
//                 case 'min': return 'Minimum';
//                 case 'max': return 'Maximum';
//                 case 'countByValue': return 'Count Unique Values';
//                 default: return 'Sum';
//             }
//         };
//         const selectedAggregation = widget.aggregations?.[0] || 'sum';
//         const aggregatorName = getAggregatorName(selectedAggregation);
//         const aggregatedData = pivotData.map(item => ({
//             ...item,
//             'Value': applyAggregation([item['Value']], selectedAggregation),
//         }));
//         return (
//             <div style={{ height: '100%', overflow: 'auto' }}>
//                 <PivotTable
//                     data={aggregatedData}
//                     rows={[widget.xAxis]}
//                     cols={['Measure']}
//                     vals={['Value']}
//                     aggregatorName={aggregatorName}
//                     rendererName="Table"
//                     sorters={{ Value: (a, b) => parseFloat(a) - parseFloat(b) }}
//                     unusedOrientationCutoff={Infinity}
//                 />
//             </div>
//         );
//     };

//     const renderChart = (widget) => {
//         const { labels, series } = chartData[widget.i] || { labels: widget.labels || [], series: widget.dataSourceType === 'script' ? widget.yAxes.map((name, idx) => ({ name, data: widget.data[idx] || [] })) : [] };
//         console.log(`Rendering chart for widget ${widget.i}:`, { labels, series }); // Debug log

//         if (!labels.length || !series.length) {
//             return <Typography.Text type="secondary">No data available</Typography.Text>;
//         }

//         if (widget.type === 'pivot') return renderPivot(widget, { labels, series });
//         if (widget.type === 'NormalTable') return renderNormalTable(widget, { labels, series });

//         const options = getChartOptions(widget, labels);
//         let chartSeries = [];
//         if (widget.type === 'pie' || widget.type === 'donut') {
//             chartSeries = series.length > 0 ? (Array.isArray(series[0].data) ? series[0].data : series).map(val => parseFloat(val) || 0) : [];
//         } else if (widget.type.startsWith('radar')) {
//             chartSeries = series.map(s => ({ name: s.name, data: s.data.map(val => parseFloat(val) || 0) }));
//         } else {
//             chartSeries = series.map(s => ({ name: s.name, data: s.data.map(val => parseFloat(val) || 0) }));
//         }

//         return (
//             <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
//                 <div style={{ flex: 1 }}>
//                     <ReactApexChart
//                         options={{
//                             ...options,
//                             xaxis: { ...options.xaxis, categories: labels },
//                             tooltip: { shared: true, intersect: false },
//                             chart: {
//                                 ...options.chart,
//                                 animations: { enabled: true },
//                                 dropShadow: { enabled: true, blur: 3, opacity: 0.2 },
//                             },
//                         }}
//                         series={chartSeries}
//                         type={widget.type.startsWith('radar') ? 'radar' : widget.type}
//                         height="95%"
//                     />
//                 </div>
//                 <div style={{ textAlign: 'center', padding: '6px', fontWeight: 'bold', fontSize: '14px' }}>{widget.xAxis}</div>
//             </div>
//         );
//     };

//     const renderDataSourceFields = () => (
//         <>
//             <Form.Item name="dataSourceType" label="Data Source Type" initialValue="manual">
//                 <Select onChange={handleDataSourceTypeChange}>
//                     <Option value="manual">Manually select X-axis & Y-axis values</Option>
//                     <Option value="script">Use a custom script</Option>
//                 </Select>
//             </Form.Item>
//             {dataSourceType === 'manual' ? (
//                 <>
//                     <Form.Item name="tableAndFields" label="X Axis">
//                         <Cascader
//                             options={databaseTables.map(table => ({
//                                 value: table,
//                                 label: table,
//                                 children: (headers || []).map(header => ({ value: header, label: header })),
//                             }))}
//                             placeholder="Select table → X field"
//                             onChange={value => {
//                                 if (value && value.length > 0) {
//                                     const tableName = value[0];
//                                     setSelectedTable(tableName);
//                                     fetchTableFields(tableName);
//                                     if (value.length === 2) updateXLabels(value[1]);
//                                 }
//                             }}
//                             loadData={async (selectedOptions) => {
//                                 const targetOption = selectedOptions[0];
//                                 targetOption.loading = true;
//                                 await fetchTableFields(targetOption.value);
//                                 targetOption.loading = false;
//                                 targetOption.children = headers.map(header => ({ value: header, label: header }));
//                                 setDatabaseTables([...databaseTables]);
//                             }}
//                         />
//                     </Form.Item>
//                     <Form.List name="yData">
//                         {(fields, { add, remove }) => (
//                             <>
//                                 {fields.map(({ key, name, ...restField }, index) => (
//                                     <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
//                                         <Form.Item {...restField} name={[name, 'aggregation']} label={`Aggregation ${index + 1}`}>
//                                             <Select placeholder="Select aggregation method" allowClear>
//                                                 {aggregationOptions.map(option => (
//                                                     <Option key={option.value} value={option.value}>{option.label}</Option>
//                                                 ))}
//                                             </Select>
//                                         </Form.Item>
//                                         <Form.Item {...restField} name={[name, 'yColumns']} label={`Y Axis Field ${index + 1}`}>
//                                             <Cascader
//                                                 options={databaseTables.map(table => ({
//                                                     value: table,
//                                                     label: table,
//                                                     children: (headers || []).map(header => ({ value: header, label: header })),
//                                                 }))}
//                                                 placeholder="Select table → Y field"
//                                                 onChange={value => {
//                                                     if (value && value.length > 0) {
//                                                         const tableName = value[0];
//                                                         setSelectedTable(tableName);
//                                                         fetchTableFields(tableName);
//                                                         if (value.length === 2) updateYValues(value[1], index);
//                                                     }
//                                                 }}
//                                                 loadData={async (selectedOptions) => {
//                                                     const targetOption = selectedOptions[0];
//                                                     targetOption.loading = true;
//                                                     await fetchTableFields(targetOption.value);
//                                                     targetOption.loading = false;
//                                                     targetOption.children = headers.map(header => ({ value: header, label: header }));
//                                                     setDatabaseTables([...databaseTables]);
//                                                 }}
//                                             />
//                                         </Form.Item>
//                                         {fields.length > 1 && <Button onClick={() => remove(name)}>Remove</Button>}
//                                     </Space>
//                                 ))}
//                                 <Form.Item>
//                                     <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>Add Y Axis</Button>
//                                 </Form.Item>
//                             </>
//                         )}
//                     </Form.List>
//                 </>
//             ) : (
//                 <Form.Item name="customScript" label="Custom Script" rules={[{ required: true, message: 'Please enter a custom script' }]}>
//                 <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
//                     <span>Custom Script</span>
//                     <Tooltip title="Click for schema guide">
//                         <Button
//                             type="text"
//                             icon={<InfoOutlined />}
//                             onClick={() => setIsSchemaModalOpen(true)}
//                             style={{ marginLeft: 8 }}
//                         />
//                     </Tooltip>
//                 </div>
//                 <Input.TextArea
//                     rows={8}
//                     placeholder={`Enter JavaScript that returns an object with labels and series:
// Example:
// return {
// labels: ['Jan', 'Feb', 'Mar'],
// series: [
//     { name: 'Sales', data: [100, 200, 300] },
//     { name: 'Expenses', data: [50, 100, 150] }
// ]
// }`}
//                 />
//             </Form.Item>
//         )}
//     </>
// );
// //                 <Form.Item name="customScript" label="Custom Script" rules={[{ required: true, message: 'Please enter a custom script' }]}>
// //                     <Input.TextArea
// //                         rows={8}
// //                         placeholder={`Enter JavaScript that returns an object with labels and series:
// // Example:
// //   return {
// //     labels: ['Jan', 'Feb', 'Mar'],
// //     series: [
// //         { name: 'Sales', data: [100, 200, 300] },
// //         { name: 'Expenses', data: [50, 100, 150] }
// //     ]
// // }`}
// //                     />
// //                 </Form.Item>
// //             )}
// //         </>
// //     );

//     return (
//         <Layout className="dashboard-layout">
//             <Header className="dashboard-header">
//                 <Title level={3} style={{ color: 'white', margin: 0 }}>Dashboard Visualization</Title>
//                 <Space>
//                     <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal}>Add Widget</Button>
//                 </Space>
//             </Header>
//             <div style={{ marginBottom: '16px', textAlign: 'right', padding: '20px 24px' }}>
//                 <RangePicker
//                     defaultValue={[dayjs(), dayjs()]}
//                     value={selectedDateRange.length === 2 ? [dayjs(selectedDateRange[0]), dayjs(selectedDateRange[1])] : null}
//                     onChange={(dates, dateStrings) => {
//                         if (!dates || dateStrings.every(date => date === '')) {
//                             setSelectedDateRange([]);
//                         } else {
//                             setSelectedDateRange(dateStrings.map(date => dayjs(date, 'DD-MM-YYYY').format('YYYY-MM-DD')));
//                         }
//                     }}
//                     style={{ width: '250px' }}
//                     placeholder={['Start Date', 'End Date']}
//                     format="DD-MM-YYYY"
//                     allowClear={true}
//                 />
//             </div>
//             <Content className="dashboard-content">
//                 <ResponsiveGridLayout
//                     className="layout"
//                     layouts={{
//                         lg: widgets.map(widget => ({ ...widget, i: widget.i, x: widget.x || 0, y: widget.y || 0, w: widget.w || 4, h: widget.h || 3 })),
//                         md: widgets.map(widget => ({ ...widget, i: widget.i, x: widget.x || 0, y: widget.y || 0, w: Math.min(widget.w || 4, 6), h: widget.h || 3 })),
//                         sm: widgets.map(widget => ({ ...widget, i: widget.i, x: 0, y: widget.y || 0, w: 12, h: widget.h || 3 })),
//                         xs: widgets.map(widget => ({ ...widget, i: widget.i, x: 0, y: widget.y || 0, w: 12, h: widget.h || 3 })),
//                     }}
//                     breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
//                     cols={{ lg: 12, md: 6, sm: 12, xs: 12 }}
//                     rowHeight={100}
//                     margin={[10, 10]}
//                     containerPadding={[15, 15]}
//                     onLayoutChange={handleLayoutChange}
//                     draggableHandle=".drag-handle"
//                     isResizable={true}
//                     isDraggable={true}
//                     style={{ minHeight: '100vh' }}
//                 >
//                     {widgets.map((widget) => (
//                         <div key={widget.i} className="widget-container">
//                             <Card
//                                 title={<div className="drag-handle"><DragOutlined className="drag-icon" /> {widget.title}</div>}
//                                 extra={
//                                     <Space>
//                                         <Button type="text" icon={<EditOutlined />} onClick={() => openEditModal(widget)} className="edit-button" />
//                                         <Popconfirm
//                                             title="Are you sure you want to delete this widget?"
//                                             description="This action cannot be undone."
//                                             onConfirm={() => handleWidgetDelete(widget._id)}
//                                             okText="Yes"
//                                             cancelText="No"
//                                             placement="topRight"
//                                         >
//                                             <Button type="text" icon={<DeleteOutlined />} className="delete-button" />
//                                         </Popconfirm>
//                                     </Space>
//                                 }
//                                 bordered={true}
//                                 className="widget-card"
//                                 style={{ height: '100%' }}
//                             >
//                                 <div className="widget-content">
//                                     {renderChart(widget)}
//                                 </div>
//                                 {widget.tableId && (
//                                     <div className="widget-data-source">
//                                         <Typography.Text type="secondary">
//                                             Data source: {widget.tableId} ({widget.xColumn} → {widget.yColumns.join(', ')})
//                                             {widget.aggregations.some(agg => agg) ? ` [${widget.aggregations.filter(agg => agg).join(', ')}]` : ''}
//                                         </Typography.Text>
//                                     </div>
//                                 )}
//                             </Card>
//                         </div>
//                     ))}
//                 </ResponsiveGridLayout>
//                 <Modal
//                     title="Custom Script Schema Guide"
//                     open={isSchemaModalOpen}
//                     onCancel={() => setIsSchemaModalOpen(false)}
//                     footer={null}
//                     width={800}
//                 >
//                     <div style={{ marginBottom: 16 }}>
//                         <Title level={5}>Required Schema Format:</Title>
//                         <pre style={{ backgroundColor: '#f5f5f5', padding: 12, borderRadius: 4 }}>
//                             {`{
//   labels: Array<string>,   // X-axis labels
//   series: Array<{
//     name: string,          // Series name
//     data: Array<number>    // Y-axis values
//   }>
// }`}
//                         </pre>
//                     </div>

//                     <Divider />

//                     <Title level={5}>Chart Type Specific Requirements:</Title>
//                     <Table
//                         columns={[
//                             { title: 'Chart Type', dataIndex: 'type', key: 'type' },
//                             { title: 'Requirements', dataIndex: 'requirements', key: 'requirements' },
//                             { title: 'Example', dataIndex: 'example', key: 'example' },
//                         ]}
//                         dataSource={[
//                             {
//                                 key: '1',
//                                 type: 'Pie/Donut',
//                                 requirements: 'Single series only. Labels must match data length.',
//                                 example: `{
//   labels: ['Jan', 'Feb', 'Mar'],
//   series: [{ name: 'Sales', data: [100, 200, 300] }]
// }`
//                             },
//                             {
//                                 key: '2',
//                                 type: 'Bar/Line/Area',
//                                 requirements: 'Multiple series supported. All series must have same data length as labels.',
//                                 example: `{
//   labels: ['Q1', 'Q2', 'Q3'],
//   series: [
//     { name: 'Product A', data: [400, 300, 600] },
//     { name: 'Product B', data: [200, 500, 400] }
//   ]
// }`
//                             },
//                             {
//                                 key: '3',
//                                 type: 'Radar',
//                                 requirements: 'Multiple series supported. Data points will be connected.',
//                                 example: `{
//   labels: ['Speed', 'Reliability', 'Comfort'],
//   series: [
//     { name: 'Model X', data: [80, 90, 70] },
//     { name: 'Model Y', data: [70, 85, 80] }
//   ]
// }`
//                             },
//                             {
//                                 key: '4',
//                                 type: 'Tables',
//                                 requirements: 'Same as Bar/Line charts. Will be displayed in tabular format.',
//                                 example: `{
//   labels: ['Team A', 'Team B', 'Team C'],
//   series: [
//     { name: 'Points', data: [100, 120, 90] },
//     { name: 'Assists', data: [30, 45, 25] }
//   ]
// }`
//                             }
//                         ]}
//                         pagination={false}
//                         size="small"
//                         bordered
//                     />

//                     <Divider />

//                     <Title level={5}>Available Utilities in Script:</Title>
//                     <ul>
//                         <li><strong>axios</strong> - For making HTTP requests</li>
//                         <li><strong>dayjs</strong> - For date manipulation</li>
//                         <li><strong>console</strong> - For debugging</li>
//                     </ul>
//                 </Modal>

//                 <Modal
//                     title={isEditMode ? 'Edit Widget' : 'Add New Widget'}
//                     open={isModalOpen}
//                     onCancel={closeModal}
//                     footer={null}
//                     width={700}
//                     confirmLoading={loading}
//                 >
//                     <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
//                         <Form.Item name="title" label="Widget Title" rules={[{ required: true, message: 'Please enter a widget title' }]}>
//                             <Input placeholder="Enter widget title" />
//                         </Form.Item>
//                         <Form.Item name="type" label="Chart Type" rules={[{ required: true, message: 'Please select a chart type' }]}>
//                             <Select placeholder="Select chart type">
//                                 {chartTypes.map(type => <Option key={type.value} value={type.value}>{type.label}</Option>)}
//                                 <Select.OptGroup label="Radar Charts">
//                                     {radarTypes.map(type => <Option key={type.value} value={type.value}>{type.label}</Option>)}
//                                 </Select.OptGroup>
//                             </Select>
//                         </Form.Item>
//                         <Divider>Data Source</Divider>
//                         {renderDataSourceFields()}
//                         <Divider>Widget Size</Divider>
//                         <div style={{ display: 'flex', gap: '16px' }}>
//                             <Form.Item name="w" label="Width (columns)" rules={[{ required: true, message: 'Please enter width' }]} style={{ flex: 1 }}>
//                                 <InputNumber min={1} max={12} style={{ width: '100%' }} />
//                             </Form.Item>
//                             <Form.Item name="h" label="Height (rows)" rules={[{ required: true, message: 'Please enter height' }]} style={{ flex: 1 }}>
//                                 <InputNumber min={1} max={6} style={{ width: '100%' }} />
//                             </Form.Item>
//                         </div>
//                         <div className="form-actions" style={{ marginTop: '16px', textAlign: 'right' }}>
//                             <Button onClick={closeModal} style={{ marginRight: '8px' }}>Cancel</Button>
//                             <Button type="primary" htmlType="submit" loading={loading}>{isEditMode ? 'Update Widget' : 'Add Widget'}</Button>
//                         </div>
//                     </Form>
//                 </Modal>
//             </Content>
//         </Layout>
//     );
// };

// export default DashboardVisualization;