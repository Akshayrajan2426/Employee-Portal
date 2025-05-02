import { useState, useEffect, useContext, useCallback,useRef  } from 'react';
import GridLayout from 'react-grid-layout';
import { Responsive, WidthProvider } from 'react-grid-layout';
import ReactApexChart from 'react-apexcharts';
import { Modal, Button, Form, Input, Select, InputNumber, Typography, Divider, Card, Layout, Space, message, Cascader, Table, Popconfirm, DatePicker } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, DragOutlined, InfoCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './DashboardVisualization.css';
import PivotTableUI from 'react-pivottable/PivotTableUI';
import 'react-pivottable/pivottable.css';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import utc from 'dayjs/plugin/utc';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';                     
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import CodeEditor from '../../components/CodeEditor/CodeEditor';
import DotObject from '../DotObject/DotObject';
import NotFoundPage from '../../pages/NotFoundPage/NotFoundPage';
import { use } from 'react';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(customParseFormat);
dayjs.extend(utc);

const { Option } = Select;
const { Title } = Typography;
const { Header, Content } = Layout;
const ResponsiveGridLayout = WidthProvider(Responsive);
const { RangePicker } = DatePicker;

const DashboardVisualization = ({ initialWidgets = null, onWidgetChange = () => { }, onWidgetCreated = () => { },fetchAvailableWidgets }) => {
    const { globalPermissions, token, user } = useContext(AuthContext);
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
    const [loading, setLoading] = useState(true);
    const [headers, setHeaders] = useState([]);
    const [chartData, setChartData] = useState({});
    const [tableRawData, setTableRawData] = useState([]);
    const [isDataPopulated, setIsDataPopulated] = useState(false);
    const [selectedDateRange, setSelectedDateRange] = useState([]);
    const [dataSourceType, setDataSourceType] = useState('manual');
    const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
    const [availableRoles, setAvailableRoles] = useState([]);
    const [canCreateWidget, setCanCreateWidget] = useState(false);
    const [canAddWidget, setCanAddWidget] = useState(false);
    const [isLayoutChanged, setIsLayoutChanged] = useState(false); // Track layout changes
    const isInitialRender = useRef(true); // Track initial render
    // Pivot table states (per widget)
    const [pivotStates, setPivotStates] = useState({});
    const [xAxisTables, setXAxisTables] = useState({});
    const [yAxisTables, setYAxisTables] = useState({});
    const [xAxisFieldsMap, setXAxisFieldsMap] = useState({});
    const [yAxisFieldsMap, setYAxisFieldsMap] = useState({});
    const [xAxisFieldSelections, setXAxisFieldSelections] = useState({});
    const [yAxisFieldSelections, setYAxisFieldSelections] = useState({});
    const [xAxisDataMap, setXAxisDataMap] = useState({});
    const [yAxisDataMap, setYAxisDataMap] = useState({});
    const [tables, setTables] = useState([]);

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

    useEffect(() => {
        if (globalPermissions && globalPermissions.includes("dashboards.update")) {
            setCanAddWidget(true);
        } else {
            setCanAddWidget(false);
        }

    }, [globalPermissions]);

    useEffect(() => {
        if (globalPermissions && globalPermissions.includes("charts.create")) {
            setCanCreateWidget(true);
        } else {
            setCanCreateWidget(false);
        }

    }, [globalPermissions]);

    // console.log("Roles", globalPermissions.includes("dashboards.update"));
    // console.log("user", user);

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
        fetchRoles();
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
                }
            }
        };
        fetchDataForWidgets();
    }, [widgets, selectedDateRange]); // Removed custom script execution
    useEffect(() => {
        if (initialWidgets !== null) {
            setWidgets(initialWidgets);
        } else {
            // fetchDatabaseTables();
            fetchDashboardWidgets();
        }
    }, [initialWidgets]);




    useEffect(() => {
        widgets.forEach(widget => {
            if (widget.type === 'pivot' && widget.tableId) {
                fetchTableFields(widget.tableId, widget.i);
                setXAxisTables(prev => ({ ...prev, [widget.i]: widget.tableId }));
                setYAxisTables(prev => ({ ...prev, [widget.i]: widget.tableId }));
            }
        });
    }, [widgets]);

    useEffect(() => {
        if (!isLayoutChanged) return; // Only execute when layout changes are saved
    
        Object.entries(yAxisTables).forEach(([widgetId, table]) => {
            const field = yAxisFieldSelections[widgetId];
            if (table && field) {
                axios.get(`${import.meta.env.VITE_API_URI}/api/data/${table}`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                    .then(response => {
                        setYAxisDataMap(prev => ({ ...prev, [widgetId]: response.data.data || [] }));
                    })
                    .catch(error => {
                        console.error(`Error fetching y-axis data for widget ${widgetId}:`, error);
                        setYAxisDataMap(prev => ({ ...prev, [widgetId]: [] }));
                    });
            } else {
                setYAxisDataMap(prev => ({ ...prev, [widgetId]: [] }));
            }
        });
    }, [isLayoutChanged, yAxisTables, yAxisFieldSelections, token]);

    useEffect(() => {
        Object.entries(yAxisTables).forEach(([widgetId, table]) => {
            const field = yAxisFieldSelections[widgetId];
            if (table && field) {
                axios.get(`${import.meta.env.VITE_API_URI}/api/data/${table}`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                    .then(response => {
                        setYAxisDataMap(prev => ({ ...prev, [widgetId]: response.data.data || [] }));
                    })
                    .catch(error => {
                        console.error(`Error fetching y-axis data for widget ${widgetId}:`, error);
                        setYAxisDataMap(prev => ({ ...prev, [widgetId]: [] }));
                    });
            } else {
                setYAxisDataMap(prev => ({ ...prev, [widgetId]: [] }));
            }
        });
    }, [yAxisTables, yAxisFieldSelections, token]);
    const fetchRoles = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URI}/api/data/roles`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log("response>>>>>>", response);
            console.log("response.data>>>>>>.", response.data.data);

            if (response?.data?.data) {
                const roles = response.data.data.map(role => ({
                    value: role.roleName, // Assuming 'name' is the field in the roles table
                    label: role.roleDisplayName,
                }));
                setAvailableRoles(roles);
            }
        } catch (error) {
            console.error('Error fetching roles:', error);
            message.error('Failed to load roles');
            setAvailableRoles([]);
        }
    };

    const fetchDatabaseTables = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URI}/api/data/get-all-tables`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response?.data?.data) {
                const tableNames = response.data.data.map(table => ({ name: table }));
                setDatabaseTables(response.data.data);
                setTables(tableNames);
            }
        } catch (error) {
            message.error('Failed to load database tables');
            setDatabaseTables([]);
            setTables([]);
        } finally {
            setLoading(false);
        }

    };

    const fetchDashboardWidgets = async () => {
        setLoading(true);
        try {
            const widgetResponse = await axios.get(`${import.meta.env.VITE_API_URI}/api/data/charts`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log("token>>>>>><<<<<<<<", token);

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
                xAxisTitle: widget.xAxisTitle || widget.xAxis || 'X-Axis',
                yAxisTitle: widget.yAxisTitle || '',
                labels: Array.isArray(widget.labels) ? widget.labels : JSON.parse(widget.labels || '[]'),
                data: Array.isArray(widget.data) ? widget.data : [JSON.parse(widget.data || '[]')],
                x: widget.x || 0,
                y: widget.y || 0,
                w: widget.w || 4,
                h: widget.h || 4,
                tableId: widget.tableId,
                xColumn: widget.xColumn,
                yColumns: Array.isArray(widget.yColumns) ? widget.yColumns : [widget.yColumns],
                aggregations: widget.aggregations || [],
                created_at: widget.created_at || widget.createdAt,
                updated_at: widget.updated_at,
                dataSourceType: widget.dataSourceType || 'manual',
                customScript: widget.customScript || '',
                roles: widget.roles || [],
            }));
            const userRoles = user?.roles || []; // Assuming user.roles is an array of role names
            const accessibleWidgets = formattedWidgets.filter(widget =>
                widget.roles.length === 0 || // Show widgets with no roles assigned to all
                widget.roles.some(role => userRoles.includes(role))
            );

            setWidgets(formattedWidgets);
            onWidgetChange();
        } catch (error) {
            console.error('Error fetching widgets:', error);
            message.error('Failed to load dashboard widgets');
            setWidgets([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchTableFields = async (tableName, widgetId = null) => {
        setLoadingFields(true);
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URI}/api/data/${tableName}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            let allFieldNames = [];
            if (response.data.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
                const responseData = response.data.data;
                if (!widgetId) setTableRawData(responseData);
                const uniqueFields = new Set();
                responseData.forEach((row) => {
                    Object.keys(row).forEach((key) => uniqueFields.add(key));
                });
                allFieldNames = Array.from(uniqueFields);
                if (widgetId) {
                    setXAxisFieldsMap(prev => ({ ...prev, [widgetId]: allFieldNames }));
                    setYAxisFieldsMap(prev => ({ ...prev, [widgetId]: allFieldNames }));
                } else {
                    setHeaders(allFieldNames);
                    setXAxisFieldsMap(prev => ({ ...prev, form: allFieldNames }));
                    setYAxisFieldsMap(prev => ({ ...prev, form: allFieldNames }));
                }
            } else {
                if (!widgetId) setTableRawData([]);
            }

            if (response.data.fields && Array.isArray(response.data.fields)) {
                allFieldNames = response.data.fields.map((field) => field.name);
                if (widgetId) {
                    setXAxisFieldsMap(prev => ({ ...prev, [widgetId]: allFieldNames }));
                    setYAxisFieldsMap(prev => ({ ...prev, [widgetId]: allFieldNames }));
                } else {
                    setTableFields(response.data.fields);
                }
            } else {
                if (!widgetId) setTableFields(allFieldNames.map((name) => ({ name })));
            }

            if (!widgetId) setSelectedTableColumns(allFieldNames);
        } catch (error) {
            console.error('Error fetching table fields:', error);
            message.error('Failed to load table fields');
            if (widgetId) {
                setXAxisFieldsMap(prev => ({ ...prev, [widgetId]: [] }));
                setYAxisFieldsMap(prev => ({ ...prev, [widgetId]: [] }));
            } else {
                setTableFields([]);
                setTableRawData([]);
                setHeaders([]);
                setSelectedTableColumns([]);
                setXAxisFieldsMap(prev => ({ ...prev, form: [] }));
                setYAxisFieldsMap(prev => ({ ...prev, form: [] }));
            }
        } finally {
            setLoadingFields(false);
        }
    };

    const handleLayoutChange = useCallback((newLayout) => {
        if (isInitialRender.current) {
            // Skip setting isLayoutChanged during the initial render
            isInitialRender.current = false;
            return;
        }
        if (!newLayout || !Array.isArray(newLayout)) return;
    
        const updatedWidgets = widgets.map((widget) => {
            const layoutItem = newLayout.find((item) => item.i === widget.i);
            return layoutItem ? { ...widget, x: layoutItem.x, y: layoutItem.y, w: layoutItem.w, h: layoutItem.h } : widget;
        });
    
        setWidgets(updatedWidgets);
        setIsLayoutChanged(true); // Mark layout as changed
    }, [widgets]);

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
            h: 4,
            title: ' ',
            xAxis: defaultFields[0],
            yAxes: defaultFields[1],
            xAxisTitle: defaultFields[0],
            yAxisTitle: defaultFields[1],
            labels: defaultLabels,
            data: defaultData,
            tableId: defaultTable,
            xColumn: defaultFields[0],
            yColumns: defaultFields[1],
            aggregations: [],
            dataSourceType: 'manual',
            roles: [],
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
                xAxisTitle: widget.xAxisTitle || widget.xAxis || 'X-Axis',
                yAxisTitle: widget.yAxisTitle || widget.yAxes.join(', ') || 'Values',
                roles: widget.roles || [],
            });
            setDataSourceType('script');
        } else {
            if (widget.tableId) {
                fetchTableFields(widget.tableId);
            } else {
                setSelectedTableColumns([]);
            }
            const yColumnValues = Array.isArray(widget.yColumns)
                ? widget.yColumns.map(col => [widget.tableId, col])
                : [];
            const yData = widget.yData && Array.isArray(widget.yData)
                ? widget.yData.map((item, index) => ({
                    yColumns: yColumnValues[index] || undefined,
                    aggregation: item.aggregation || undefined,
                }))
                : [{ yColumns: undefined, aggregation: undefined }];

            form.setFieldsValue({
                title: widget.title,
                type: widget.type,
                xAxis: widget.xAxis,
                yData: yData,
                labels: Array.isArray(widget.labels) ? widget.labels.join(', ') : '',
                w: widget.w,
                h: widget.h,
                tableAndFields: widget.tableId && widget.xColumn ? [widget.tableId, widget.xColumn] : undefined,
                yColumns: yColumnValues,
                dataSourceType: 'manual',
                xAxisTitle: widget.xAxisTitle || widget.xAxis || 'X-Axis',
                yAxisTitle: widget.yAxisTitle || widget.yColumns.join(', ') || 'Values',
                roles: widget.roles || [],
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
                await axios.delete(`${import.meta.env.VITE_API_URI}/api/data/charts/${widgetToDelete._id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setWidgets((prevWidgets) => prevWidgets.filter((w) => w._id !== widgetId));
                message.success('Widget deleted successfully');
                if (initialWidgets === null) {
                    await fetchDashboardWidgets();
                } else {
                    onWidgetChange();
                }
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

      const handleFormSubmit = useCallback(async (values) => {
        try {
            setLoading(true);
            let widgetData;
    
            if (dataSourceType === 'manual') {
                const { tableAndFields, type, title, w, h, yData, yAxisTitle, xAxisTitle, roles } = values;
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
                    yAxisTitle,
                    xAxisTitle,
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
                    roles: roles || [],
                };
            } else if (dataSourceType === 'script') {
                const { title, type, w, h, customScript, xAxisTitle, yAxisTitle, roles } = values;
    
                // Execute the custom script only when the form is submitted
                const scriptExecutionResult = await executeCustomScript(values.customScript, values.type);
    
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
                    xAxis: 'custom_script',
                    yAxes: scriptExecutionResult.series.map(s => s.name),
                    xAxisTitle: values.xAxisTitle,
                    yAxisTitle: values.yAxisTitle,
                    tableId: 'custom_script',
                    xColumn: 'custom_script',
                    yColumns: scriptExecutionResult.series.map(s => s.name),
                    aggregations: [],
                    created_at: isEditMode ? currentWidget.created_at : new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    dataSourceType: 'script',
                    customScript: values.customScript,
                    roles: roles || [],
                };
    
                if (values.type === 'pie' || values.type === 'donut') {
                    widgetData.data = [scriptExecutionResult.series];
                    widgetData.yAxes = ['Values'];
                    widgetData.yColumns = ['Values'];
                } else {
                    widgetData.data = scriptExecutionResult.series.map(s => s.data);
                }
    
                setChartData(prev => ({
                    ...prev,
                    [widgetData.i]: {
                        labels: scriptExecutionResult.labels,
                        series: scriptExecutionResult.series,
                    },
                }));
            }
    
            const sanitizedWidgetData = JSON.parse(JSON.stringify(widgetData));
    
            let newWidget;
            if (isEditMode) {
                await axios.put(`${import.meta.env.VITE_API_URI}/api/data/charts/${currentWidget._id}`, sanitizedWidgetData, {
                    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                });
                newWidget = { ...sanitizedWidgetData, _id: currentWidget._id };
                setWidgets(prevWidgets =>
                    prevWidgets.map(widget =>
                        widget._id === currentWidget._id ? newWidget : widget
                    )
                );
            } else {
                const response = await axios.post(`${import.meta.env.VITE_API_URI}/api/data/charts`, sanitizedWidgetData, {
                    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                });
                newWidget = { ...sanitizedWidgetData, _id: response.data._id || response.data.insertedId };
                setWidgets(prevWidgets => [...prevWidgets, newWidget]);
                setNextId(prev => prev + 1);
                onWidgetCreated(newWidget);
            }
    
            message.success(`Widget ${isEditMode ? 'updated' : 'added'} successfully`);
            closeModal();
        } catch (error) {
            console.error(`Error ${isEditMode ? 'updating' : 'adding'} widget:`, error);
            message.error(`Failed to ${isEditMode ? 'update' : 'add'} widget: ${error.message}`);
        } finally {
            setLoading(false);
        }
    }, [isEditMode, currentWidget, nextId, dataSourceType, token, onWidgetCreated]);

    const handleDataSourceTypeChange = (value) => {
        setDataSourceType(value);
        form.resetFields(['tableAndFields', 'yData', 'customScript']);
    };

    const executeCustomScript = async (scriptContent, chartType) => {
        try {
            const AsyncFunction = Object.getPrototypeOf(async function () { }).constructor;
            const asyncFunc = new AsyncFunction("ds", 'selectedDateRange', scriptContent);
            const result = await asyncFunc(DotObject, selectedDateRange);

            if (!result || typeof result !== 'object' || !Array.isArray(result.labels) || !result.series) {
                throw new Error('Script must return { labels: array, series: array or object }');
            }

            let filteredLabels = result.labels;
            let filteredSeries = result.series;

            // Apply date filtering only if selectedDateRange is valid
            if (Array.isArray(selectedDateRange) && selectedDateRange.length === 2) {
                const startDate = dayjs(selectedDateRange[0], 'YYYY-MM-DD').startOf('day');
                const endDate = dayjs(selectedDateRange[1], 'YYYY-MM-DD').endOf('day');

                filteredSeries = Array.isArray(result.series)
                    ? result.series.map(s => {
                        if (!s.dates) return { ...s }; // No dates, return as-is
                        const dateMatches = s.dates.map(date => {
                            const parsedDate = dayjs(date, 'DD-MM-YYYY');
                            return parsedDate.isValid() &&
                                (parsedDate.isSame(startDate, 'day') || parsedDate.isAfter(startDate)) &&
                                (parsedDate.isSame(endDate, 'day') || parsedDate.isBefore(endDate));
                        });
                        return {
                            ...s,
                            data: Array.isArray(s.data) ? s.data.map((val, index) =>
                                dateMatches[index] ? parseFloat(val) || 0 : 0
                            ) : []
                        };
                    })
                    : {
                        ...result.series,
                        data: result.series.dates && Array.isArray(result.series.data)
                            ? result.series.data.map((val, index) => {
                                const parsedDate = dayjs(result.series.dates[index], 'DD-MM-YYYY');
                                const isMatch = parsedDate.isValid() &&
                                    (parsedDate.isSame(startDate, 'day') || parsedDate.isAfter(startDate)) &&
                                    (parsedDate.isSame(endDate, 'day') || parsedDate.isBefore(endDate));
                                return isMatch ? parseFloat(val) || 0 : 0;
                            })
                            : (Array.isArray(result.series.data) ? result.series.data : [])
                    };
            }

            let series = [];
            if (chartType === 'pie' || chartType === 'donut') {
                if (Array.isArray(filteredSeries)) {
                    if (filteredSeries.length > 0) {
                        series = Array.isArray(filteredSeries[0].data)
                            ? filteredSeries[0].data.map(val => parseFloat(val) || 0)
                            : filteredSeries.map(val => parseFloat(val) || 0);
                    } else {
                        series = [];
                    }
                } else if (typeof filteredSeries === 'object' && Array.isArray(filteredSeries.data)) {
                    series = filteredSeries.data.map(val => parseFloat(val) || 0);
                } else {
                    series = [];
                }
            } else {
                if (Array.isArray(filteredSeries)) {
                    series = filteredSeries.map((s, idx) => ({
                        name: s.name || `Series ${idx + 1}`,
                        data: Array.isArray(s.data) ? s.data.map(val => parseFloat(val) || 0) : [],
                    }));
                } else if (typeof filteredSeries === 'object' && filteredSeries.data) {
                    series = [{
                        name: filteredSeries.name || 'Series 1',
                        data: Array.isArray(filteredSeries.data) ? filteredSeries.data.map(val => parseFloat(val) || 0) : [],
                    }];
                } else {
                    series = [{ name: 'Series 1', data: [] }];
                }
            }

            return {
                labels: filteredLabels,
                series
            };
        } catch (error) {
            // console.error('Error executing custom script:', error);
            // message.error(`Script execution failed: ${error.message}`);
            return { labels: ['Error'], series: chartType === 'pie' || chartType === 'donut' ? [0] : [{ name: 'Error', data: [0] }] };
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
                labels: labels,
                legend: { position: 'bottom' },
                chart: {
                    ...baseOptions.chart,
                    type: widget.type === 'donut' ? 'donut' : 'pie',
                },
                plotOptions: {
                    pie: {
                        donut: {
                            size: '55%',
                            customScale: 0.8,
                        },
                        dataLabels: {
                            offset: 0,
                            minAngleToShowLabel: 10
                        },
                    },
                },
                dataLabels: {
                    enabled: true,
                    style: {
                        fontSize: '12px',
                        fontFamily: 'Arial',
                    },
                    formatter: function (val) {
                        return val === 0 ? '0' : val;
                    },
                },
            };
        } else if (widget.type.startsWith('radar')) {
            const radarType = widget.type.split('-')[1] || 'standard';
            const isPolar = radarType === 'polar';

            return {
                ...baseOptions,
                chart: {
                    ...baseOptions.chart,
                    type: 'radar',
                },
                xaxis: {
                    categories: labels,
                },
                yaxis: {
                    min: 0,
                    forceNiceScale: true,
                    title: {
                        text: widget.yAxisTitle || 'Values',
                        style: {
                            fontSize: '14px',
                            fontWeight: 'bold',
                        },
                    },
                },
                fill: {
                    opacity: isPolar || radarType === 'filled' ? 0.8 : 0,
                    colors: isPolar || radarType === 'filled' ? ['#FF9800'] : undefined,
                },
                stroke: {
                    show: !isPolar,
                    width: radarType === 'filled' ? 0 : 2,
                    colors: radarType === 'standard' ? ['#F44336'] : undefined,
                },
                markers: {
                    size: radarType === 'standard' ? 4 : 0,
                    colors: ['#F44336'],
                },
                plotOptions: {
                    radar: {
                        polygons: {
                            strokeColors: '#e8e8e8',
                            fill: {
                                colors: isPolar ? ['rgba(55, 150, 251, 0.85)'] : ['#f8f8f8'],
                            },
                        },
                    },
                },
                dataLabels: {
                    enabled: true,
                    formatter: function (val) {
                        return val === 0 ? '0' : val;
                    },
                    style: {
                        fontSize: '12px',
                        fontFamily: 'Arial',
                    },
                },
            };
        } else {
            const chartSpecificOptions = {
                bar: {
                    plotOptions: {
                        bar: {
                            endingShape: 'rounded',
                        },
                        states: {
                            hover: {
                                filter: {
                                    type: 'none',
                                },
                            },
                        },
                        grid: {
                            padding: {
                                left: 0,
                                right: 0,
                            },
                        },
                    },
                    dataLabels: {
                        enabled: true,
                        formatter: function (val) {
                            return val === 0 ? '0' : val;
                        },
                        style: {
                            fontSize: '12px',
                            fontFamily: 'Arial',
                        },
                        offsetY: -10,
                    },
                },
                line: {
                    stroke: {
                        width: 4,
                        curve: 'smooth',
                        lineCap: 'round',
                    },
                    markers: {
                        size: 5,
                        strokeWidth: 2,
                        hover: {
                            size: 8,
                        },
                    },
                    dataLabels: {
                        enabled: true,
                        style: {
                            fontSize: '12px',
                            fontFamily: 'Arial',
                        },
                        formatter: function (val) {
                            return val === 0 ? '0' : val;
                        },
                    },
                },
                area: {
                    fill: {
                        type: 'gradient',
                        gradient: {
                            shadeIntensity: 1,
                            opacityFrom: 0.9,
                            opacityTo: 0.6,
                        },
                    },
                    dataLabels: {
                        enabled: true,
                        style: {
                            fontSize: '12px',
                            fontFamily: 'Arial',
                        },
                        formatter: function (val) {
                            return val === 0 ? '0' : val;
                        },
                    },
                },
            };

            const specificOptions = chartSpecificOptions[widget.type] || {};

            return {
                ...baseOptions,
                ...specificOptions,
                chart: {
                    ...baseOptions.chart,
                    type: widget.type,
                },
                xaxis: {
                    categories: widget.labels,
                    title: {
                        text: widget.xAxisTitle || widget.xAxis || 'X-Axis',
                    },
                    axisBorder: { show: true },
                    axisTicks: { show: true },
                },
                yaxis: {
                    title: {
                        text: widget.yAxisTitle || 'Values',
                        style: {
                            fontSize: '14px',
                            fontWeight: 'bold',
                        },
                    },
                    min: 0,
                    forceNiceScale: true,
                },
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

    const renderPivot = (widget) => {
        const widgetId = widget.i;
        const xAxisTable = xAxisTables[widgetId] || widget.tableId || '';
        const yAxisTable = yAxisTables[widgetId] || widget.tableId || '';
        const xAxisFields = xAxisFieldsMap[widgetId] || [];
        const yAxisFields = yAxisFieldsMap[widgetId] || [];
        const xAxisField = xAxisFieldSelections[widgetId] || widget.xColumn || '';
        const yAxisField = yAxisFieldSelections[widgetId] || (widget.yColumns && widget.yColumns[0]) || '';
        const xAxisData = xAxisDataMap[widgetId] || [];
        const yAxisData = yAxisDataMap[widgetId] || [];
        const combinedData = [...xAxisData, ...yAxisData].length > 0 ? [...xAxisData, ...yAxisData] : tableRawData;

        return (
            <div style={{ height: '100%', overflow: 'auto', padding: '20px' }}>
                <h1>Pivot Table</h1>
                <div style={{ marginBottom: '20px' }}>
                    <label htmlFor={`x-axis-table-select-${widgetId}`} style={{ marginRight: '10px' }}>Select X-Axis Table: </label>
                    <Select
                        id={`x-axis-table-select-${widgetId}`}
                        value={xAxisTable}
                        onChange={(value) => {
                            setXAxisTables(prev => ({ ...prev, [widgetId]: value }));
                            fetchTableFields(value, widgetId);
                        }}
                        style={{ padding: '5px', fontSize: '16px', marginRight: '20px', width: '200px' }}
                    >
                        <Option value="">--Choose a table--</Option>
                        {tables.map(table => (
                            <Option key={table.name} value={table.name}>
                                {table.name}
                            </Option>
                        ))}
                    </Select>
                    {xAxisTable && (
                        <>
                            <label htmlFor={`x-axis-field-select-${widgetId}`} style={{ marginRight: '10px' }}>Select X-Axis Field: </label>
                            <Select
                                id={`x-axis-field-select-${widgetId}`}
                                value={xAxisField}
                                onChange={(value) => setXAxisFieldSelections(prev => ({ ...prev, [widgetId]: value }))}
                                style={{ padding: '5px', fontSize: '16px', width: '200px' }}
                            >
                                <Option value="">--Choose a field--</Option>
                                {xAxisFields.map(field => (
                                    <Option key={field} value={field}>
                                        {field}
                                    </Option>
                                ))}
                            </Select>
                        </>
                    )}
                </div>
                <div style={{ marginBottom: '20px' }}>
                    <label htmlFor={`y-axis-table-select-${widgetId}`} style={{ marginRight: '10px' }}>Select Y-Axis Table: </label>
                    <Select
                        id={`y-axis-table-select-${widgetId}`}
                        value={yAxisTable}
                        onChange={(value) => {
                            setYAxisTables(prev => ({ ...prev, [widgetId]: value }));
                            fetchTableFields(value, widgetId);
                        }}
                        style={{ padding: '5px', fontSize: '16px', marginRight: '20px', width: '200px' }}
                    >
                        <Option value="">--Choose a table--</Option>
                        {tables.map(table => (
                            <Option key={table.name} value={table.name}>
                                {table.name}
                            </Option>
                        ))}
                    </Select>
                    {yAxisTable && (
                        <>
                            <label htmlFor={`y-axis-field-select-${widgetId}`} style={{ marginRight: '10px' }}>Select Y-Axis Field: </label>
                            <Select
                                id={`y-axis-field-select-${widgetId}`}
                                value={yAxisField}
                                onChange={(value) => setYAxisFieldSelections(prev => ({ ...prev, [widgetId]: value }))}
                                style={{ padding: '5px', fontSize: '16px', width: '200px' }}
                            >
                                <Option value="">--Choose a field--</Option>
                                {yAxisFields.map(field => (
                                    <Option key={field} value={field}>
                                        {field}
                                    </Option>
                                ))}
                            </Select>
                        </>
                    )}
                </div>
                {(xAxisData.length > 0 || yAxisData.length > 0) ? (
                    <PivotTableUI
                        data={combinedData}
                        onChange={(s) => setPivotStates(prev => ({ ...prev, [widgetId]: s }))}
                        {...(pivotStates[widgetId] || {})}
                    />
                ) : (
                    <p>Please select tables and fields to display the pivot table.</p>
                )}
            </div>
        );
    };

    const renderChart = (widget) => {
        const { labels, series } = chartData[widget.i] || { labels: widget.labels || [], series: widget.dataSourceType === 'script' ? widget.yAxes.map((name, idx) => ({ name, data: widget.data[idx] || [] })) : [] };

        if (!labels.length || !series.length) {
            return <Typography.Text type="secondary">No data available</Typography.Text>;
        }

        if (widget.type === 'pivot') return renderPivot(widget);
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
            </div>
        );
    };

    const showGuideModal = () => {
        setIsGuideModalOpen(true);
    };

    const handleGuideModalClose = () => {
        setIsGuideModalOpen(false);
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
                    <Form.Item
                        name="xAxisTitle"
                        label="X-Axis Title"
                        rules={[{ required: true, message: 'Please enter an X-axis title' }]}
                        getValueFromEvent={(e) => e.target.value}
                        getValueProps={(value) => {
                            const tableAndFields = form.getFieldValue('tableAndFields');
                            return { value: value || (tableAndFields && tableAndFields[1]) || 'X-Axis' };
                        }}
                    >
                        <Input placeholder="Enter X-axis title" />
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
                    <Form.Item
                        name="yAxisTitle"
                        label="Combined Y-Axis Title"
                        rules={[{ required: true, message: 'Please enter a combined Y-axis title' }]}
                        getValueFromEvent={(e) => e.target.value}
                        getValueProps={(value) => {
                            const yData = form.getFieldValue('yData') || [];
                            const yColumns = yData
                                .filter(item => item && item.yColumns)
                                .map(item => item.yColumns[1])
                                .filter(Boolean);
                            return { value: value || yColumns.join(', ') || 'Values' };
                        }}
                    >
                        <Input placeholder="Enter combined Y-axis title (e.g., Sales, Expenses, Test)" />
                    </Form.Item>
                </>
            ) : (
                <>
                    <Form.Item
                        name="customScript"
                        label={
                            <Space>
                                Custom Script
                                <Button
                                    type="link"
                                    icon={<InfoCircleOutlined />}
                                    onClick={showGuideModal}
                                    style={{ padding: 0 }}
                                />
                            </Space>
                        }
                        rules={[{ required: true, message: 'Please enter a custom script' }]}
                    >
                        <CodeEditor
                            defaultValue={currentWidget?.customScript || ''}
                            onChange={(value) => form.setFieldsValue({ customScript: value })}
                            defaultLanguage="javascript"
                            style={{ height: '200px' }}
                        />
                    </Form.Item>
                    <Form.Item
                        name="xAxisTitle"
                        label="X-Axis Title"
                        rules={[{ required: true, message: 'Please enter an X-axis title' }]}
                        initialValue="X-Axis"
                    >
                        <Input placeholder="Enter X-axis title" />
                    </Form.Item>
                    <Modal
                        title="Custom Script User Guide"
                        open={isGuideModalOpen}
                        onCancel={handleGuideModalClose}
                        footer={[
                            <Button key="close" onClick={handleGuideModalClose}>
                                Close
                            </Button>
                        ]}
                        width={800}
                    >
                        <Typography.Paragraph>
                            Custom scripts must return a JSON object with <code>labels</code> and <code>series</code> properties. Below is the schema with examples for each chart type:
                        </Typography.Paragraph>
                        <Typography.Title level={4}>Schema Definition</Typography.Title>
                        <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px', overflowX: 'auto' }}>
                            {JSON.stringify(
                                {
                                    "response": {
                                        "labels": "Array<string> - Categories or X-axis labels",
                                        "series": "Array<SeriesObject> | Array<number> - Data series (varies by chart type)",
                                        "dateRangeSupport": "Optional date filtering using selectedDateRange"
                                    },
                                    "SeriesObject": {
                                        "name": "string - Series name",
                                        "data": "Array<number> - Data values",
                                        "dates": "Optional Array<string> - Date strings in 'DD-MM-YYYY' format for filtering"
                                    },
                                    "chartTypes": [
                                        {
                                            "type": "Bar, Line, Area",
                                            "description": "Supports multiple series",
                                            "example": {
                                                "labels": ["Jan", "Feb", "Mar"],
                                                "series": [
                                                    { "name": "Sales", "data": [100, 200, 150], "dates": ["01-01-2025", "01-02-2025", "01-03-2025"] },
                                                    { "name": "Revenue", "data": [50, 75, 60], "dates": ["01-01-2025", "01-02-2025", "01-03-2025"] }
                                                ]
                                            }
                                        },
                                        {
                                            "type": "Pie, Donut",
                                            "description": "Single series, labels match data length",
                                            "example": {
                                                "labels": ["A", "B", "C"],
                                                "series": [30, 40, 30],
                                                "alternativeFormat": {
                                                    "labels": ["A", "B", "C"],
                                                    "series": [{ "name": "Values", "data": [30, 40, 30], "dates": ["01-01-2025", "01-02-2025", "01-03-2025"] }]
                                                }
                                            }
                                        },
                                        {
                                            "type": "Radar (Standard, Filled, Polar)",
                                            "description": "Multiple series, labels as axes",
                                            "example": {
                                                "labels": ["Speed", "Power", "Agility"],
                                                "series": [
                                                    { "name": "Team A", "data": [80, 90, 85], "dates": ["01-01-2025", "01-01-2025", "01-01-2025"] },
                                                    { "name": "Team B", "data": [70, 95, 80], "dates": ["01-01-2025", "01-01-2025", "01-01-2025"] }
                                                ]
                                            }
                                        },
                                        {
                                            "type": "Normal Table, Pivot Table",
                                            "description": "Multiple series, tabular format",
                                            "example": {
                                                "labels": ["Q1", "Q2", "Q3"],
                                                "series": [
                                                    { "name": "Sales", "data": [100, 200, 150], "dates": ["01-01-2025", "01-04-2025", "01-07-2025"] },
                                                    { "name": "Costs", "data": [50, 75, 60], "dates": ["01-01-2025", "01-04-2025", "01-07-2025"] }
                                                ]
                                            }
                                        }
                                    ],
                                    "dateFiltering": {
                                        "description": "Use selectedDateRange [start, end] in 'YYYY-MM-DD' format",
                                        "example": {
                                            "script": "Filter data based on date range",
                                            "code": `
    const start = dayjs(selectedDateRange[0], 'YYYY-MM-DD');
    const end = dayjs(selectedDateRange[1], 'YYYY-MM-DD');
    const filteredSeries = series.map(s => ({
        ...s,
        data: s.dates.map((date, idx) => {
            const d = dayjs(date, 'DD-MM-YYYY');
            return d.isAfter(start) && d.isBefore(end) ? s.data[idx] : 0;
        })
    }));
    return { labels, series: filteredSeries };
    `
                                        }
                                    }
                                },
                                null,
                                2
                            )}
                        </pre>
                        <Typography.Title level={4}>API Usage Example</Typography.Title>
                        <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
                            {`const projects = await ds.fetchData("projectallocations", {});

if (!projects || !Array.isArray(projects)) {
  return {
    labels: ['Error'],
    series: [{ name: 'Error', data: [0] }]
  };
}

// Extract unique project names for X-axis
const labels = projects.map(project => project.projectName || 'Unknown Project');

// Calculate total employee allocations & count billable vs non-billable employees
const employeeAllocationCount = projects.map(project => 
  Array.isArray(project.projectAllocations) ? project.projectAllocations.length : 0
);

const billableEmployeeCount = projects.map(project => 
  Array.isArray(project.projectAllocations) 
    ? project.projectAllocations.filter(emp => emp.isBillable).length 
    : 0
);

const nonBillableEmployeeCount = projects.map(project => 
  Array.isArray(project.projectAllocations) 
    ? project.projectAllocations.filter(emp => !emp.isBillable).length 
    : 0
);

// Return data for bar chart
return {
  labels,  // X-axis: Project Names
  series: [
    { name: 'Total Employee Allocations', data: employeeAllocationCount },  // Employee Allocations per Project
    { name: 'Billable Employees', data: billableEmployeeCount },  // Billable Employees per Project
    { name: 'Non-Billable Employees', data: nonBillableEmployeeCount }  // Non-Billable Employees per Project
  ]
};
`}
                        </pre>
                        <Typography.Title level={4}>Notes</Typography.Title>
                        <ul>
                            <li><code>labels</code>: Must be strings</li>
                            <li><code>series.data</code>: Must be numbers</li>
                            <li><code>series.dates</code>: Optional, used for date filtering (format: 'DD-MM-YYYY')</li>
                            <li>Use <code>ds.api</code> for API calls</li>
                            <li><code>selectedDateRange</code> is available for date filtering</li>
                        </ul>
                    </Modal>
                    <Form.Item
                        name="yAxisTitle"
                        label="Combined Y-Axis Title"
                        rules={[{ required: true, message: 'Please enter a combined Y-axis title' }]}
                        getValueFromEvent={(e) => e.target.value}
                        getValueProps={(value) => {
                            const scriptResult = Array.isArray(currentWidget?.yAxes)
                                ? currentWidget.yAxes
                                : currentWidget?.yAxes
                                    ? [currentWidget.yAxes]
                                    : [];
                            return { value: value || scriptResult.join(', ') || 'Values' };
                        }}
                    >
                        <Input placeholder="Enter combined Y-axis title (e.g., Sales, Expenses, Test)" />
                    </Form.Item>
                </>
            )}
        </>
    );

    const renderWidgets = () => {
        const widgetElements = widgets.map((widget) => (
            <div key={widget.i} className="widget-container">
                                <Card
                    title={<div className="drag-handle"><DragOutlined className="drag-icon" /> {widget.title}</div>}
                    extra={
                        <Space>
                            {globalPermissions && globalPermissions.includes("dashboards.update") && (
                                <Button
                                    type="text"
                                    icon={<EditOutlined />}
                                    onClick={() => openEditModal(widget)}
                                    className="edit-button"
                                />
                            )}
                            {globalPermissions && globalPermissions.includes("dashboards.delete") && (
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
                            )}
                        </Space>
                    }
                    bordered={true}
                    className="widget-card"
                    style={{ height: '100%' }}
                >
                    <div className="widget-content">
                        {renderChart(widget)}
                    </div>
                </Card>
            </div>
        ));

        return (
                       <ResponsiveGridLayout
                className="layout"
                layouts={{
                    lg: widgets.map(widget => ({ ...widget, i: widget.i, x: widget.x || 0, y: widget.y || 0, w: widget.w || 4, h: widget.h || 3 })),
                }}
                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
                cols={{ lg: 12, md: 6, sm: 12, xs: 12 }}
                rowHeight={100}
                margin={[10, 10]}
                containerPadding={[15, 15]}
                onLayoutChange={handleLayoutChange} // Use the updated function
                draggableHandle=".drag-handle"
                isResizable={true}
                isDraggable={true}
                style={{ minHeight: '100vh' }}
            >
                {widgetElements}
            </ResponsiveGridLayout>
        );
    };

    if (!globalPermissions || !globalPermissions.includes("charts.read")) {
         return <NotFoundPage />
    }
    if (loading) {
        return (
          <div style={{
            display: 'flex',
            justifyContent: 'center', // Center horizontally
            alignItems: 'center', // Center vertically
            height: '60vh' // Full viewport height to center in the middle of the screen
          }}>
            {/* <CircularProgress /> */}
          </div>
        );
      }

    return (
        <Layout className="dashboard-layout">
            
                <div className="button-container" style={{ display: 'flex', justifyContent: 'flex-end', padding: '20px 24px' }}>
                {(canCreateWidget) &&   <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal}>Create Charts</Button> }


                    {(canAddWidget) &&
                        <Button
                            type="primary"
                            onClick={fetchAvailableWidgets}
                        >
                            Add Existing Charts
                        </Button>
                    }
                    {globalPermissions && globalPermissions.includes("dashboards.update") && isLayoutChanged && (
                        <Button
                            type="primary"
                            onClick={() => {
                                setIsLayoutChanged(false); // Reset layout change state
                                onWidgetChange(widgets); // Trigger the save logic
                            }}
                        >
                            Save Changes
                        </Button>
                    )}

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
                        style={{ width: '250px', marginLeft: '10px' }}
                        placeholder={['Start Date', 'End Date']}
                        format="DD-MM-YYYY"
                        allowClear={true}
                    />
                     
                </div>

            {/* <div style={{ marginBottom: '16px', padding: '20px 24px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
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
            </div> */}
            <Content className="dashboard-content">
                {renderWidgets()}
                <Modal
                    title={isEditMode ? 'Edit Charts' : 'Add New Charts'}
                    open={isModalOpen}
                    onCancel={closeModal}
                    footer={null}
                    width={700}
                    confirmLoading={loading}
                >
                    <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
                        <Form.Item name="title" label="charts Title" rules={[{ required: true, message: 'Please enter a widget title' }]}>
                            <Input placeholder="Enter charts title" />
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
                        <Divider>Access Control</Divider>
                        <Form.Item
                            name="roles"
                            label="Roles (Leave empty to allow all roles)"
                            tooltip="Select roles that can view this widget. If none are selected, all roles can access it."
                        >
                            <Select
                                mode="multiple"
                                placeholder="Select roles"
                                options={availableRoles}
                                allowClear
                            />
                        </Form.Item>
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
                            <Button type="primary" htmlType="submit" loading={loading}>{isEditMode ? 'Update Charts' : 'Add Charts'}</Button>
                        </div>
                    </Form>
                </Modal>
            </Content>
        </Layout>
    );
};

export default DashboardVisualization;