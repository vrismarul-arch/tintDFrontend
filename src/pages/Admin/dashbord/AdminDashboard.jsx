import React, { useEffect, useState, useMemo } from "react";
import {
    Row,
    Col,
    Card,
    Statistic,
    Table,
    Tag,
    message,
    Spin,
    Button,
    Drawer,
    Descriptions,
    DatePicker,
    Progress,
    Select
} from "antd";
import {
    UsergroupAddOutlined,
    PhoneOutlined,
    EyeOutlined,
    DollarOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined,
    SettingOutlined,
    FileExcelOutlined
} from "@ant-design/icons";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend
} from "recharts";
// NOTE: Replace '../../../../api' with your actual API path or implementation
import api from "../../../../api";
import moment from "moment";
import "./Dashboard.css";

const { RangePicker } = DatePicker;
const { Option } = Select;
const COLORS = ["#000000ff", "#9a5fde", "#faad14", "#ff4d4f", "#722ed1"];

// =====================================================================
// DATE RANGE CONSTANTS
// =====================================================================

const DateRangeOptions = {
    'all': 'All Time',
    'today': 'Today',
    'week': 'Current Week',
    'month': 'Current Month',
    'last30days': 'Last 30 Days',
};

const getDateRangeFromKey = (key) => {
    const today = moment();
    switch (key) {
        case 'today':
            return [today.clone().startOf('day'), today.clone().endOf('day')];
        case 'week':
            // startOf('isoWeek') ensures the week starts on Monday
            return [today.clone().startOf('isoWeek'), today.clone().endOf('isoWeek')];
        case 'month':
            return [today.clone().startOf('month'), today.clone().endOf('month')];
        case 'last30days':
            return [today.clone().subtract(29, 'days').startOf('day'), today.clone().endOf('day')];
        default:
            return [null, null]; // 'all' time
    }
};

// =====================================================================
// CSV EXPORT UTILITY (Kept the same for brevity)
// =====================================================================

const convertArrayOfObjectsToCSV = (data, columns) => {
    if (!data || data.length === 0) return "";
    const headers = columns.map(col => col.title).join(',');

    const rows = data.map(record => {
        const rowData = columns.map(col => {
            let value = '';
            if (col.key === 'customer') {
                value = record.user?.name || record.name || "Unknown";
            } else if (col.key === 'services') {
                value = record.services?.map(s => `${s.serviceId?.name || s.name} x ${s.quantity || 1}`).join('; ');
            } else if (col.key === 'dateTime') {
                value = `${moment(record.selectedDate).format("DD MMM YYYY")} at ${moment(record.selectedTime).format("HH:mm")}`;
            } else if (col.key === 'assignedTo') {
                value = record.assignedTo?.name || "Unassigned";
            } else if (col.key === 'status') {
                value = record.status?.toUpperCase() || "N/A";
            } else if (col.dataIndex) {
                value = record[col.dataIndex];
            } else {
                value = '';
            }
            // Sanitize value for CSV
            return `"${String(value).replace(/"/g, '""')}"`;
        }).join(',');
        return rowData;
    });

    return [headers, ...rows].join('\n');
};

const ExportExcelButton = ({ data, columns, fileName = "dashboard_export" }) => {
    const handleExport = () => {
        if (!data || data.length === 0) {
            return message.warning("No data to export.");
        }
        const csvString = convertArrayOfObjectsToCSV(data, columns);
        const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });

        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `${fileName}_${moment().format('YYYYMMDD_HHmmss')}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            message.success("Data exported successfully!");
        } else {
            message.error("Your browser does not support automatic downloads.");
        }
    };

    return (
        <Button
            onClick={handleExport}
            icon={<FileExcelOutlined />}
            type="primary"
            size="large"
            style={{ backgroundColor: COLORS[1], borderColor: COLORS[1] }}
        >
            Export to CSV
        </Button>
    );
};


// =====================================================================
// REUSABLE COMPONENTS (Kept the same for brevity)
// =====================================================================

const StatCircleCard = ({ title, value, trend, trendColor, icon: Icon, circleValue, circleColor }) => {
    const isPositive = trend.includes('+');
    const trendTagColor = isPositive ? 'success' : 'error';
    const arrow = isPositive ? <ArrowUpOutlined /> : <ArrowDownOutlined />;

    const circlePercentage = Math.min(circleValue, 100);
    const strokeDasharray = 283;
    const strokeDashoffset = strokeDasharray - (strokeDasharray * circlePercentage) / 100;

    return (
        <Card bordered={false} className="stat-circle-card modern-stat-card">
            <Row gutter={16} align="middle">
                <Col span={18}>
                    <Statistic
                        title={<span style={{ color: '#8c8c8c', textTransform: 'uppercase' }}>{title}</span>}
                        value={value}
                        prefix={Icon && <Icon style={{ color: trendColor, fontSize: '18px' }} />}
                        valueStyle={{ color: '#000', fontSize: '24px', fontWeight: 'bold' }}
                    />
                    <Tag color={trendTagColor} style={{ marginTop: 8 }}>
                        {arrow} {trend}
                    </Tag>
                </Col>
                <Col span={6} style={{ textAlign: 'center' }}>
                    <div className="custom-progress-circle-wrapper">
                        <svg viewBox="0 0 100 100" className="custom-progress-svg">
                            <circle cx="50" cy="50" r="45" fill="none" stroke="#f0f0f0" strokeWidth="6" />
                            <circle
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                stroke={circleColor}
                                strokeWidth="6"
                                strokeLinecap="round"
                                strokeDasharray={strokeDasharray}
                                strokeDashoffset={strokeDashoffset}
                                transform="rotate(-90 50 50)"
                            />
                            <text x="50" y="50" textAnchor="middle" dominantBaseline="middle" fontSize="16" fontWeight="bold" fill="#000">
                                {circlePercentage}%
                            </text>
                        </svg>
                    </div>
                </Col>
            </Row>
        </Card>
    );
};

const MetricCard = ({ title, value, percentage, trendColor }) => {
    const isPositive = trendColor === 'green';
    const arrow = isPositive ? <ArrowUpOutlined /> : <ArrowDownOutlined />;
    const trendTagColor = isPositive ? 'success' : 'error';

    return (
        <Card bordered={false} className="metric-card modern-stat-card" style={{ padding: '12px 0' }}>
            <Row align="middle" justify="space-between" style={{ padding: '0 16px' }}>
                <Statistic
                    title={<span style={{ color: '#8c8c8c' }}>{title}</span>}
                    value={value}
                    valueStyle={{ fontSize: '22px', fontWeight: 'bold' }}
                />
                <Tag color={trendTagColor} style={{ marginLeft: 8 }}>
                    {arrow} {percentage}
                </Tag>
            </Row>
        </Card>
    );
};

const BookingTrafficChart = ({ data }) => (
    <Card
        title="Booking & Revenue Trend (Last 7 Days)"
        extra={<Button size="small">Details</Button>}
        className="modern-chart-card"
        style={{ height: '100%' }}
    >
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" angle={-45} textAnchor="end" height={60} interval={0} fontSize={10} />

                <YAxis yAxisId="left" orientation="left" stroke="#000000ff" label={{ value: 'Bookings', angle: -90, position: 'insideLeft', fill: '#000000ff' }} />
                <YAxis yAxisId="right" orientation="right" stroke="#9a5fde" label={{ value: 'Revenue (₹)', angle: 90, position: 'insideRight', fill: '#9a5fde' }} />

                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />

                <Bar yAxisId="left" dataKey="bookings" fill="#000000ff" name="Total Bookings" barSize={20} />
                <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#9a5fde" name="Total Revenue" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
            </BarChart>
        </ResponsiveContainer>
    </Card>
);

const StatusCircleChart = ({ pieData, total }) => {
    const confirmedEntry = pieData.find(d => d.name === 'confirmed');
    const confirmedPercent = total > 0 ? ((confirmedEntry?.value / total) * 100) : 0;
    const mainValue = Math.round(confirmedPercent);
    const leadsRemaining = total - (confirmedEntry?.value || 0);
    const gradientColors = { '0%': COLORS[1], '100%': COLORS[0] };

    return (
        <Card title="Booking Conversion Rate" extra={<SettingOutlined />} className="modern-chart-card" style={{ height: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
                <Progress
                    type="circle"
                    percent={mainValue}
                    width={150}
                    strokeColor={gradientColors}
                    format={() => (
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#8c8c8c' }}>
                            Confirmed
                            <div style={{ fontSize: '24px', color: COLORS[1] }}>{mainValue}%</div>
                        </div>
                    )}
                />

                <div style={{ marginTop: 24, textAlign: 'center' }}>
                    <Statistic
                        value={leadsRemaining}
                        valueStyle={{ color: COLORS[2], fontSize: '20px' }}
                        title="Leads Remaining"
                    />
                    <Progress
                        percent={mainValue}
                        showInfo={false}
                        strokeColor={COLORS[1]}
                        style={{ marginTop: 4, width: '100px' }}
                    />
                </div>
            </div>
        </Card>
    );
};


// =====================================================================
// MAIN DASHBOARD COMPONENT
// =====================================================================

export default function AdminDashboard() {
    const [bookings, setBookings] = useState([]);
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(false);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);

    // --- FILTER STATES ---
    const [dateRange, setDateRange] = useState(null);
    // New state to manage the selected quick date filter (e.g., 'week', 'month')
    const [quickDateFilter, setQuickDateFilter] = useState('all'); 
    const [statusFilter, setStatusFilter] = useState("all");
    const [staffFilter, setStaffFilter] = useState("all");

    // Helper to determine the effective date range for the API call
    const effectiveDateRange = useMemo(() => {
        if (dateRange && dateRange[0] && dateRange[1]) {
            // Priority to custom RangePicker selection
            return dateRange;
        } else if (quickDateFilter !== 'all') {
            // Use the quick filter's predefined range
            return getDateRangeFromKey(quickDateFilter);
        }
        return [null, null]; // No date filter applied
    }, [dateRange, quickDateFilter]);

    // Fetching functions
    const fetchPartners = async () => {
        try {
            // Replace with your actual partner API endpoint
            const { data } = await api.get("/api/admin/partners");
            setPartners(Array.isArray(data) ? data : data.partners || []);
        } catch (err) {
            console.error(err);
            message.error("Failed to fetch partners");
        }
    };

    const fetchBookings = async () => {
        setLoading(true);
        const [startMoment, endMoment] = effectiveDateRange;
        
        let query = `/api/admin/bookings?`;

        // 1. Append Date Range to API Call
        if (startMoment && endMoment) {
            // Convert to ISO strings for API, ensuring start is startOf('day') and end is endOf('day')
            const startDate = startMoment.clone().startOf('day').toISOString();
            const endDate = endMoment.clone().endOf('day').toISOString();
            
            // Assuming your API can accept 'startDate' and 'endDate' query parameters
            query += `startDate=${startDate}&endDate=${endDate}&`;
        }
        
        // 2. Append other filters to API Call (if your API supports server-side filtering)
        // NOTE: For simplicity, I'm keeping the original client-side filtering below for status/staff, 
        // but the ideal implementation would pass these to the API as well.
        
        try {
            // Replace with your actual bookings API endpoint, including date query
            const { data } = await api.get(query); 
            
            // Assuming the API response is an object with a 'bookings' array or directly an array
            const bookingsArray = Array.isArray(data) ? data : data.bookings || [];
            
            setBookings(bookingsArray);
            
        } catch (err) {
            console.error("API call failed:", err);
            message.error("Failed to fetch bookings");
        } finally {
            setLoading(false);
        }
    };

    // Effect to refetch bookings whenever the effective date range changes
    useEffect(() => {
        fetchBookings();
    }, [effectiveDateRange]); // Trigger fetch when the date range changes

    // Initial load for partners (since they're static for filtering)
    useEffect(() => {
        fetchPartners();
    }, []);

    // Handlers for filter changes
    const handleRangePickerChange = (dates) => {
        setDateRange(dates);
        setQuickDateFilter('custom'); // Mark as custom when range picker is used
    };

    const handleQuickFilterChange = (key) => {
        setQuickDateFilter(key);
        setDateRange(null); // Clear custom range when quick filter is used
    };


    // -------------------------------------------------------------------
    // CORE FILTERING LOGIC (Now only handles status and staff, as date is API-side)
    // -------------------------------------------------------------------
    const filteredBookings = useMemo(() => {
        let currentBookings = bookings;

        // 1. Status Filter
        if (statusFilter !== "all") {
            currentBookings = currentBookings.filter(
                (b) => (b.status || 'unknown').toLowerCase() === statusFilter
            );
        }

        // 2. Staff/Partner Filter
        if (staffFilter !== "all") {
            currentBookings = currentBookings.filter(
                (b) => (b.assignedTo?._id || 'unassigned') === staffFilter
            );
        }

        return currentBookings;
    }, [bookings, statusFilter, staffFilter]);

    // ... (Drawer, columns, stats, pieData, exportColumns remain the same) ...

    const openDrawer = (record) => {
        setSelectedBooking(record);
        setDrawerVisible(true);
    };

    const closeDrawer = () => {
        setSelectedBooking(null);
        setDrawerVisible(false);
    };

    // Table Columns
    const columns = useMemo(() => [
        { title: "Booking ID", dataIndex: "bookingId", key: "bookingId", render: (id) => <strong>{id || "-"}</strong>, width: 120 },
        {
            title: "Customer Name",
            key: "customer",
            render: (_, record) => (
                <div>
                    <strong>{record.user?.name || record.name || "Unknown"}</strong>
                    <br />
                    <span>{record.user?.phone || record.phone || "-"}</span>
                </div>
            ),
            width: 180
        },
        // Hidden column for CSV export of phone number
        { title: "Customer Phone", key: "phone", dataIndex: ["user", "phone"], hidden: true },
        {
            title: "Services",
            dataIndex: "services",
            key: "services",
            render: (services) =>
                services?.length
                    ? services.map((s) => (
                          <Tag key={s._id || s.serviceId?._id} color="blue">
                              {s.serviceId?.name || s.name} × {s.quantity || 1}
                          </Tag>
                      ))
                    : "-",
            width: 250
        },
        {
            title: "Date & Time",
            key: "dateTime",
            render: (_, record) => (
                <div>
                    {moment(record.selectedDate).format("DD MMM YYYY")}
                    <br />
                    {moment(record.selectedTime).format("HH:mm")}
                </div>
            ),
            sorter: (a, b) => moment(a.selectedDate).unix() - moment(b.selectedDate).unix(),
            width: 150
        },
        {
            title: "Total Amount",
            dataIndex: "totalAmount",
            key: "totalAmount",
            render: (amount) => `₹${Number(amount || 0).toFixed(2)}`,
            sorter: (a, b) => Number(a.totalAmount || 0) - Number(b.totalAmount || 0),
            width: 120
        },
        {
            title: "Assigned Staff",
            key: "assignedTo",
            render: (_, record) =>
                record.assignedTo?.name ? <Tag color="geekblue">{record.assignedTo.name}</Tag> : <Tag color="red">Unassigned</Tag>,
            width: 120
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status) => {
                const color = status === "confirmed" ? "green" : status === "pending" ? "gold" : "red";
                return <Tag color={color}>{status?.toUpperCase() || "N/A"}</Tag>;
            },
            width: 120
        },
        {
            title: "Action",
            key: "action",
            render: (_, record) => (
                <Button type="link" icon={<EyeOutlined />} onClick={() => openDrawer(record)}>
                    View
                </Button>
            ),
            fixed: 'right',
            width: 80
        },
    ], []);


    // Dashboard Stats (Calculated from filteredBookings)
    const stats = useMemo(() => {
        const totalBookings = filteredBookings.length;
        const confirmedBookings = filteredBookings.filter(b => b.status === 'confirmed').length;
        const totalRevenue = filteredBookings.reduce((sum, b) => sum + Number(b.totalAmount || 0), 0);
        const leadsFollowUp = filteredBookings.filter((b) => b.status === "pending").length;
        const activePartners = partners.length;

        // Last 7 days trend data (Uses unfiltered 'bookings' for consistent timeline)
        const last7Days = Array.from({ length: 7 }).map((_, i) => {
            const day = moment().subtract(6 - i, "days");
            const bookingsOfDay = bookings.filter((b) => moment(b.selectedDate).isSame(day, "day"));
            const revenueOfDay = bookingsOfDay.reduce((sum, b) => sum + Number(b.totalAmount || 0), 0);
            return {
                day: day.format("DD MMM"),
                bookings: bookingsOfDay.length,
                revenue: revenueOfDay,
            };
        });

        const currentRevenue = last7Days[6]?.revenue || 0;
        const previousRevenue = last7Days[5]?.revenue || 0;
        const revenueChange = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : (currentRevenue > 0 ? 100 : 0);
        const revenueTrend = `${revenueChange >= 0 ? '+' : ''}${revenueChange.toFixed(0)}%`;
        const revenueTrendColor = revenueChange >= 0 ? '#9a5fde' : '#ff4d4f';

        return {
            totalBookings,
            confirmedBookings,
            totalRevenue,
            leadsFollowUp,
            activePartners,
            last7Days,
            revenueTrend,
            revenueTrendColor
        };
    }, [filteredBookings, partners, bookings]);

    // Pie Data (Calculated from filteredBookings)
    const pieData = useMemo(() => {
        const map = {};
        filteredBookings.forEach((b) => {
            const status = b.status || "unknown";
            map[status] = (map[status] || 0) + 1;
        });
        return Object.entries(map).map(([name, value]) => ({
            name,
            value,
            fill: name === 'confirmed' ? COLORS[1] : name === 'pending' ? COLORS[2] : name === 'cancelled' ? COLORS[3] : COLORS[0]
        }));
    }, [filteredBookings]);

    // Columns for CSV export (excludes action column)
    const exportColumns = useMemo(() => columns.filter(col => col.key !== 'action' && col.key !== 'S.No').map(col => ({
        ...col,
        title: col.title,
        key: col.key || col.dataIndex,
        dataIndex: col.dataIndex,
    })), [columns]);


    // --- RENDER FUNCTION (MAIN LAYOUT) ---
    return (
        <div className="dashboard-container">
            {/* Filters Row */}
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }} align="middle" justify="space-between">

                {/* New Quick Date Filter */}
                <Col xs={24} sm={8} lg={3}>
                    <Select
                        size="large"
                        placeholder="Quick Filter"
                        style={{ width: '100%' }}
                        onChange={handleQuickFilterChange}
                        value={quickDateFilter}
                    >
                        {Object.entries(DateRangeOptions).map(([key, label]) => (
                            <Option key={key} value={key}>{label}</Option>
                        ))}
                        <Option key="custom" value="custom" disabled={!dateRange}>Custom Range</Option>
                    </Select>
                </Col>

                {/* Range Picker (Updated to be conditional based on quick filter) */}
                <Col xs={24} sm={8} lg={4}>
                    <RangePicker
                        style={{ width: "100%" }}
                        onChange={handleRangePickerChange}
                        allowClear
                        size="large"
                        placeholder={['Start Date', 'End Date']}
                        // Control the component with the dateRange state
                        value={dateRange}
                        // Disable if a quick filter other than 'all' or 'custom' is selected
                        disabled={quickDateFilter !== 'all' && quickDateFilter !== 'custom'}
                    />
                </Col>

                <Col xs={24} sm={8} lg={4}>
                    <Select
                        size="large"
                        placeholder="Filter by Status"
                        style={{ width: '100%' }}
                        onChange={(value) => setStatusFilter(value)}
                        value={statusFilter}
                    >
                        <Option value="all">All Statuses</Option>
                        <Option value="confirmed">Confirmed</Option>
                        <Option value="pending">Pending</Option>
                        <Option value="cancelled">Cancelled</Option>
                        <Option value="completed">Completed</Option>
                    </Select>
                </Col>

                <Col xs={24} sm={8} lg={4}>
                    <Select
                        size="large"
                        placeholder="Filter by Staff"
                        style={{ width: '100%' }}
                        onChange={(value) => setStaffFilter(value)}
                        value={staffFilter}
                    >
                        <Option value="all">All Staff</Option>
                        <Option value="unassigned">Unassigned</Option>
                        {partners.map(p => (
                            <Option key={p._id} value={p._id}>
                                {p.name}
                            </Option>
                        ))}
                    </Select>
                </Col>

                <Col xs={24} lg={4} style={{ textAlign: 'right' }}>
                    <ExportExcelButton
                        data={filteredBookings}
                        columns={exportColumns}
                        fileName="Bookings_Leads"
                    />
                </Col>
            </Row>

            {loading ? (
                <div className="center-spinner"><Spin size="large" /></div>
            ) : (
                <>
                    {/* ROW 1: STATS CIRCLE CARDS */}
                    <Row gutter={[24, 24]}>
                        <Col xs={24} sm={12} lg={6}>
                            <StatCircleCard title="TOTAL BOOKINGS" value={stats.totalBookings.toString()} trend={stats.revenueTrend} trendColor={stats.revenueTrendColor} icon={UsergroupAddOutlined} circleValue={Math.min(Math.round((stats.totalBookings / (stats.activePartners * 10 || 1)) * 100), 99)} circleColor={COLORS[0]}/>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                            <StatCircleCard title="TOTAL REVENUE" value={`₹${stats.totalRevenue.toFixed(0)}`} trend={stats.revenueTrend} trendColor={stats.revenueTrendColor} icon={DollarOutlined} circleValue={Math.min(Math.round((stats.totalRevenue / 50000) * 100), 99)} circleColor={COLORS[3]}/>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                            <StatCircleCard title="PENDING LEADS" value={stats.leadsFollowUp.toString()} trend="↓ 5%" trendColor="#ff4d4f" icon={PhoneOutlined} circleValue={Math.min(stats.leadsFollowUp * 10, 99)} circleColor={COLORS[2]}/>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                            <StatCircleCard title="ACTIVE PARTNERS" value={stats.activePartners.toString()} trend="+3%" trendColor="#9a5fde" icon={UsergroupAddOutlined} circleValue={Math.min(stats.activePartners * 10, 99)} circleColor={COLORS[1]}/>
                        </Col>
                    </Row>

                    {/* ROW 2: CHARTS */}
                    <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
                        <Col xs={24} lg={18}>
                            <BookingTrafficChart data={stats.last7Days} />
                        </Col>
                        <Col xs={24} lg={6}>
                            <StatusCircleChart pieData={pieData} total={stats.totalBookings} />
                        </Col>
                    </Row>

                    {/* ROW 3: METRIC CARDS */}
                    <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>

                        <Col xs={24} sm={12} lg={6}>
                            <MetricCard
                                title="Total Revenue"
                                value={`₹${stats.totalRevenue.toFixed(0)}`}
                                percentage={stats.revenueTrend}
                                trendColor={stats.revenueTrendColor === '#9a5fde' ? 'green' : 'red'}
                            />
                        </Col>

                        <Col xs={24} sm={12} lg={6}>
                            <MetricCard
                                title="PENDING LEADS"
                                value={stats.leadsFollowUp.toString()}
                                percentage="+8%"
                                trendColor="red"
                            />
                        </Col>

                        <Col xs={24} sm={12} lg={6}>
                            <MetricCard
                                title="Average Booking Value"
                                value={`₹${(stats.totalRevenue / stats.confirmedBookings || 0).toFixed(0)}`}
                                percentage="↓ 5%"
                                trendColor="red"
                            />
                        </Col>

                        <Col xs={24} sm={12} lg={6}>
                            <MetricCard
                                title="CONFIRMED BOOKINGS"
                                value={stats.confirmedBookings.toString()}
                                percentage="+3%"
                                trendColor="green"
                            />
                        </Col>
                    </Row>


                    {/* ROW 4: BOOKINGS TABLE */}
                    <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
                        <Col xs={24}>
                            <Card
                                bordered={false}
                                className="table-card"
                                title="Recent Bookings / Leads"
                                style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderRadius: '8px' }}
                            >
                                <Table
                                    columns={columns.filter(col => col.key !== 'phone')}
                                    dataSource={filteredBookings.map((b, index) => ({...b, _index: index + 1}))}
                                    pagination={{ pageSize: 5 }}
                                    rowKey={(record) => record._id || record.bookingId}
                                    scroll={{ x: "max-content" }}
                                />
                            </Card>
                        </Col>
                    </Row>

                    {/* Drawer for Booking Details */}
                    <Drawer title="Booking Details" width={480} onClose={closeDrawer} open={drawerVisible}>
                        {selectedBooking ? (
                            <Descriptions bordered column={1} size="small" labelStyle={{ fontWeight: 600 }}>
                                <Descriptions.Item label="Booking ID">{selectedBooking.bookingId || "-"}</Descriptions.Item>
                                <Descriptions.Item label="Customer">{selectedBooking.user?.name || selectedBooking.name || "-"}</Descriptions.Item>
                                <Descriptions.Item label="Phone">{selectedBooking.user?.phone || selectedBooking.phone || "-"}</Descriptions.Item>
                                <Descriptions.Item label="Email">{selectedBooking.user?.email || selectedBooking.email || "-"}</Descriptions.Item>
                                <Descriptions.Item label="Date">{moment(selectedBooking.selectedDate).format("DD MMM YYYY")}</Descriptions.Item>
                                <Descriptions.Item label="Time">{moment(selectedBooking.selectedTime).format("HH:mm")}</Descriptions.Item>
                                <Descriptions.Item label="Assigned Staff">{selectedBooking.assignedTo?.name || "Unassigned"}</Descriptions.Item>
                                <Descriptions.Item label="Status">
                                    <Tag color={selectedBooking.status === "confirmed" ? "green" : selectedBooking.status === "pending" ? "gold" : "red"}>
                                        {selectedBooking.status?.toUpperCase()}
                                    </Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="Total Amount">₹{Number(selectedBooking.totalAmount || 0).toFixed(2)}</Descriptions.Item>
                                <Descriptions.Item label="Services">
                                    {selectedBooking.services?.map((s, idx) => (
                                        <Tag color="blue" key={idx}>{s.serviceId?.name || s.name} × {s.quantity || 1}</Tag>
                                    )) || "-"}
                                </Descriptions.Item>
                            </Descriptions>
                        ) : (
                            <Spin />
                        )}
                    </Drawer>
                </>
            )}
        </div>
    );
}