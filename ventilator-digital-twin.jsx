import { useState, useEffect, useRef, useMemo } from "react";
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine } from "recharts";

/* ─── EMBEDDED PATIENT DATA (real ventilator CSV recordings) ─── */
const RAW = {
  p1:[[0.0,28.13,4.53,386.72],[0.04,28.45,4.65,382.81],[0.08,27.67,5.0,378.91],[0.12,26.5,5.12,374.35],[0.16,27.41,4.57,371.09],[0.2,30.01,4.22,367.84],[0.24,30.6,4.49,366.54],[0.28,29.56,4.8,363.93],[0.32,28.52,5.12,360.68],[0.36,37.76,5.9,333.33],[0.4,82.03,12.97,333.33],[0.44,91.08,21.02,346.35],[0.48,91.67,26.84,369.14],[0.52,91.34,30.9,396.48],[0.56,91.6,34.53,424.48],[0.6,91.6,37.15,456.38],[0.64,91.8,40.9,484.38],[0.68,91.86,43.98,514.97],[0.72,91.93,47.3,544.27],[0.76,91.6,50.98,572.92],[0.8,92.12,53.95,603.52],[0.84,91.93,56.6,635.42],[0.88,92.12,59.53,666.02],[0.92,80.27,62.54,694.66],[0.96,43.55,58.75,722.01],[1.0,-36.52,41.02,756.51],[1.04,-66.67,14.57,744.14],[1.08,-24.67,8.52,694.01],[1.12,-10.48,8.91,664.71],[1.16,-17.64,7.42,636.07],[1.2,17.71,5.04,465.49],[1.24,20.57,4.69,456.38],[1.28,24.61,4.73,449.22],[1.32,23.89,5.27,442.71],[1.36,23.05,5.31,436.2],[1.4,23.18,5.0,429.69],[1.44,22.79,5.2,422.53],[1.48,23.5,4.77,416.02],[1.52,25.72,4.45,410.16],[1.56,27.93,4.53,406.25],[1.6,25.78,5.43,401.04],[1.64,23.89,5.27,395.83],[1.68,25.65,4.45,390.63],[1.72,27.99,4.53,386.07],[1.76,27.99,4.73,382.81],[1.8,28.32,4.69,379.56],[1.84,27.93,4.96,375.65],[1.88,24.93,5.7,369.14],[1.92,23.24,5.39,363.93],[1.96,23.83,5.0,358.07],[2.0,25.46,4.84,352.86],[2.04,27.02,4.73,347.66],[2.08,27.99,4.8,344.4],[2.12,27.86,4.88,340.49],[2.16,29.56,4.41,337.24],[2.2,30.79,4.45,335.29],[2.24,29.95,4.84,333.33],[2.28,51.69,6.13,333.33],[2.32,88.61,15.78,333.98],[2.36,91.67,22.81,352.86],[2.4,91.41,28.13,376.3],[2.44,91.54,32.66,402.34],[2.48,91.54,35.23,434.24],[2.52,91.67,37.58,466.15],[2.56,91.8,39.69,499.35],[2.6,91.73,43.05,528.65],[2.64,91.67,46.68,557.29],[2.68,91.93,50.39,585.94],[2.72,91.47,53.91,614.58],[2.76,91.86,57.19,644.53],[2.8,92.12,60.39,674.48],[2.84,68.68,62.42,701.82],[2.88,31.45,56.29,728.52],[2.92,-66.67,32.58,761.07],[2.96,-66.67,11.21,725.26],[3.0,-18.42,8.28,677.08],[3.04,-14.71,8.36,645.83],[3.08,-11.33,6.76,619.14],[3.12,-5.73,5.94,593.75],[3.16,-1.89,6.02,569.01],[3.2,1.24,5.39,548.18],[3.24,6.77,4.96,529.95],[3.28,13.54,4.77,515.63],[3.32,19.14,5.04,503.91],[3.36,20.83,5.39,494.14],[3.4,19.73,5.59,485.03],[3.44,18.82,5.35,475.91],[3.48,20.57,4.88,468.1],[3.52,20.18,5.47,458.33],[3.56,17.45,5.47,447.92],[3.6,20.25,4.53,440.76],[3.64,21.55,4.92,431.64],[3.68,24.61,4.34,425.78],[3.72,26.5,4.73,420.57],[3.76,26.5,5.04,415.36],[3.8,23.96,5.74,407.55],[3.84,22.07,5.43,401.69],[3.88,22.85,5.0,395.18],[3.92,24.48,4.88,389.32],[3.96,25.98,4.84,384.11],[4.0,26.43,5.04,378.91],[4.04,26.17,5.08,374.35],[4.08,26.82,4.84,370.44],[4.12,27.02,5.0,365.89],[4.16,26.82,5.0,361.33],[4.2,27.15,4.88,357.42],[4.24,26.95,5.12,352.86],[4.28,27.08,4.88,348.96],[4.32,28.52,4.69,345.7],[4.36,28.71,4.8,342.45],[4.4,28.45,4.96,339.19],[4.44,27.15,5.31,333.98],[4.48,26.43,5.2,333.33],[4.52,27.21,4.88,333.33],[4.56,29.04,4.88,333.33],[4.6,67.38,8.24,333.33],[4.64,91.28,18.2,339.19],[4.68,92.32,24.41,361.33],[4.72,92.58,28.16,389.97],[4.76,92.51,31.05,421.22],[4.8,92.25,34.49,450.52],[4.84,92.38,37.73,481.12],[4.88,92.12,41.33,509.77],[4.92,92.25,44.65,539.71],[4.96,92.19,47.97,569.66],[5.0,92.51,51.05,600.26],[5.04,92.38,53.83,632.16],[5.08,92.45,56.76,663.41],[5.12,89.97,60.0,693.36],[5.16,56.18,60.12,719.4],[5.2,5.34,50.35,747.4],[5.24,-66.67,22.38,760.42],[5.28,-60.74,8.87,709.64],[5.32,-11.65,8.71,671.88],[5.36,-18.42,8.16,639.97],[5.4,-6.77,5.55,616.54],[5.44,2.54,5.43,594.4],[5.48,7.42,5.23,576.17],[5.52,13.67,4.84,562.5],[5.56,15.3,5.55,548.18],[5.6,18.75,4.88,539.06],[5.64,18.16,5.82,526.69],[5.68,15.3,5.74,515.63],[5.72,16.54,5.04,505.86],[5.76,19.34,4.96,496.09],[5.8,19.79,5.23,486.33],[5.84,20.57,5.04,477.86],[5.88,22.59,4.8,470.7],[5.92,22.98,5.16,462.89],[5.96,22.98,5.12,456.38],[6.0,24.54,4.65,450.52],[6.04,26.04,4.77,445.31],[6.08,27.73,4.49,441.41],[6.12,30.08,4.3,438.15],[6.16,27.54,5.39,433.59],[6.2,22.59,6.17,425.78],[6.24,20.12,5.66,419.27],[6.28,21.81,5.0,412.76],[6.32,25.46,4.53,406.9],[6.36,26.82,4.96,401.69],[6.4,25.98,5.23,396.48],[6.44,25.85,5.08,391.93],[6.48,26.3,4.96,387.37],[6.52,26.69,5.0,382.81],[6.56,26.89,4.92,378.26],[6.6,27.15,4.92,374.35],[6.64,27.73,4.84,370.44],[6.68,27.6,5.0,366.54],[6.72,27.73,4.88,363.28],[6.76,27.99,4.8,359.38],[6.8,29.36,4.53,356.77],[6.84,29.88,4.69,354.17],[6.88,36.46,5.2,333.33],[6.92,79.75,11.48,333.33],[6.96,91.41,21.29,341.8],[7.0,91.54,27.03,364.58],[7.04,91.6,31.33,391.28],[7.08,91.73,34.53,420.57],[7.12,92.25,36.91,453.13],[7.16,92.32,39.41,485.68],[7.2,92.19,42.42,516.28],[7.24,92.12,45.66,546.22],[7.28,92.19,49.1,576.17],[7.32,92.12,52.7,604.82],[7.36,91.99,56.37,634.11],[7.4,91.54,59.73,663.41],[7.44,83.07,63.2,690.76],[7.48,46.42,60.9,716.8],[7.52,-25.2,46.05,747.4],[7.56,-66.67,16.95,745.44],[7.6,-32.88,8.55,695.96],[7.64,-9.18,8.67,666.02],[7.68,-17.32,7.73,636.07],[7.72,-13.02,6.52,607.42],[7.76,-5.21,5.59,582.03],[7.8,0.52,5.43,559.24],[7.84,3.65,5.35,538.41],[7.88,9.11,4.77,522.14],[7.92,16.54,4.41,508.46],[7.96,22.46,4.77,499.35]],
  p2:[[0.0,62.63,8.01,477.86],[0.04,63.54,7.93,497.4],[0.08,64.71,8.01,518.23],[0.12,65.23,7.89,539.06],[0.16,66.47,7.85,561.2],[0.2,68.29,7.89,583.98],[0.24,68.55,8.05,606.77],[0.28,67.64,8.05,630.21],[0.32,67.84,7.97,652.99],[0.36,67.71,8.09,675.78],[0.4,65.69,8.4,697.27],[0.44,57.88,8.79,715.49],[0.48,45.77,8.87,727.21],[0.52,15.89,6.76,731.77],[0.56,-3.19,5.98,712.89],[0.6,-3.84,5.35,688.8],[0.64,-2.47,5.47,664.71],[0.68,-2.21,5.74,641.28],[0.72,-3.91,6.02,615.89],[0.76,-4.69,5.94,591.15],[0.8,-4.75,5.74,566.41],[0.84,-2.6,5.51,541.67],[0.88,0.65,5.39,518.88],[0.92,5.92,5.47,498.7],[0.96,9.9,5.55,481.77],[1.0,11.98,5.66,467.45],[1.04,12.7,5.7,453.13],[1.08,13.61,5.66,440.1],[1.12,13.87,5.66,427.08],[1.16,14.58,5.7,414.06],[1.2,15.43,5.7,401.69],[1.24,15.69,5.7,389.97],[1.28,16.08,5.66,378.26],[1.32,16.6,5.63,367.19],[1.36,17.25,5.59,356.12],[1.4,18.42,5.51,345.7],[1.44,20.12,5.31,336.59],[1.48,22.33,5.12,333.33],[1.52,24.74,5.04,333.33],[1.56,26.82,4.92,333.33],[1.6,29.49,4.53,333.33],[1.64,44.92,4.22,338.54],[1.68,65.3,5.78,350.26],[1.72,72.53,7.62,369.79],[1.76,68.42,8.36,392.58],[1.8,63.09,8.2,414.71],[1.84,63.15,8.01,434.9],[1.88,63.93,8.09,455.08],[1.92,63.61,8.01,475.26],[1.96,65.43,7.97,496.09],[2.0,66.41,8.01,517.58],[2.04,66.73,8.01,540.36],[2.08,66.41,7.97,562.5],[2.12,67.38,7.97,584.64],[2.16,66.93,8.13,606.77],[2.2,65.95,8.2,628.91],[2.24,63.48,8.36,649.09],[2.28,57.75,8.59,666.67],[2.32,47.07,8.95,678.39],[2.36,12.11,6.56,683.59],[2.4,-9.44,5.74,660.81],[2.44,-8.85,5.39,633.46],[2.48,-6.38,5.66,605.47],[2.52,-5.66,5.86,578.78],[2.56,-4.04,5.78,553.39],[2.6,-1.04,5.74,529.95],[2.64,2.47,5.74,508.46],[2.68,5.4,5.74,488.93],[2.72,7.81,5.86,470.7],[2.76,9.31,5.9,454.43],[2.8,10.29,5.9,438.8],[2.84,11.59,5.9,423.83],[2.88,11.72,5.94,409.51],[2.92,12.04,5.9,395.18],[2.96,12.96,5.82,381.51],[3.0,13.8,5.74,368.49],[3.04,15.17,5.63,356.12],[3.08,16.8,5.55,345.05],[3.12,17.45,5.55,333.98],[3.16,18.1,5.51,333.33],[3.2,19.08,5.47,333.33],[3.24,20.7,5.31,333.33],[3.28,23.18,5.08,333.33],[3.32,25.72,4.92,333.33],[3.36,28.52,4.65,333.33],[3.4,41.02,3.95,336.59],[3.44,66.15,4.84,349.61],[3.48,81.97,6.68,374.35],[3.52,84.11,7.85,404.3],[3.56,80.01,8.4,435.55],[3.6,77.15,7.93,466.8],[3.64,78.13,7.93,496.09],[3.68,79.69,8.01,526.69],[3.72,80.99,7.89,557.94],[3.76,81.84,8.01,589.84],[3.8,81.12,8.09,621.74],[3.84,80.66,8.09,653.65],[3.88,79.69,8.16,684.9],[3.92,77.28,8.32,714.19],[3.96,74.22,8.16,742.84],[4.0,73.11,8.2,769.53],[4.04,70.44,8.28,794.92],[4.08,68.16,8.28,819.01],[4.12,65.56,8.36,841.15],[4.16,62.5,8.4,861.33],[4.2,57.03,8.55,878.26],[4.24,47.79,8.98,889.97],[4.28,3.32,6.45,892.58],[4.32,-13.87,5.39,863.93],[4.36,12.96,4.22,843.1],[4.4,28.84,3.63,836.59],[4.44,33.46,3.83,835.29],[4.48,33.2,4.34,835.29],[4.52,32.42,4.73,835.29],[4.56,31.51,4.92,833.98],[4.6,30.86,5.0,832.68],[4.64,30.47,4.96,830.73],[4.68,30.66,4.92,828.78],[4.72,8.01,8.01,815.1],[4.76,-32.88,7.89,779.95],[4.8,-23.76,6.25,742.84],[4.84,-9.37,5.35,712.24],[4.88,1.37,5.39,688.15],[4.92,6.71,5.66,668.62],[4.96,8.07,5.94,650.39],[5.0,8.66,5.98,634.11],[5.04,8.92,5.98,617.84],[5.08,9.44,5.94,601.56],[5.12,9.38,6.17,584.64],[5.16,11.07,5.59,570.31],[5.2,20.96,4.8,333.33],[5.24,20.7,7.93,333.33],[5.28,17.38,7.77,333.33],[5.32,19.01,8.05,333.33],[5.36,19.27,8.24,333.33],[5.4,17.58,8.28,333.33],[5.44,17.71,8.05,333.33],[5.48,7.16,6.41,333.33],[5.52,6.97,5.27,333.33],[5.56,14.65,4.57,333.33],[5.6,20.7,5.59,333.33],[5.64,21.81,5.35,333.33],[5.68,23.11,5.27,333.33],[5.72,23.24,5.47,333.33],[5.76,22.92,5.59,333.33],[5.8,22.79,5.59,333.33],[5.84,22.66,5.55,333.33],[5.88,22.98,5.35,333.33],[5.92,23.83,5.23,333.33],[5.96,24.28,5.27,333.33],[6.0,24.48,5.39,333.33],[6.04,24.15,5.47,333.33],[6.08,24.09,5.47,333.33],[6.12,24.48,5.31,333.33],[6.16,25.46,5.08,333.33],[6.2,26.89,5.0,333.33],[6.24,27.86,4.96,333.33],[6.28,28.26,5.0,333.33],[6.32,28.52,5.04,333.33],[6.36,27.73,5.39,333.33],[6.4,21.48,5.47,333.33],[6.44,21.68,5.47,333.33],[6.48,22.14,5.43,333.33],[6.52,22.59,5.39,333.33],[6.56,22.85,5.39,333.33],[6.6,22.92,5.43,333.33],[6.64,22.85,5.51,333.33],[6.68,22.66,5.51,333.33],[6.72,22.98,5.35,333.33],[6.76,23.89,5.2,333.33],[6.8,24.93,5.12,333.33],[6.84,26.37,5.08,333.33],[6.88,27.41,5.0,333.33],[6.92,28.65,4.88,333.33],[6.96,29.82,4.69,333.33],[7.0,36.07,4.38,334.64],[7.04,54.62,5.51,341.8],[7.08,65.63,7.19,356.77],[7.12,63.28,8.28,375.0],[7.16,57.55,8.32,392.58],[7.2,56.38,7.93,408.85],[7.24,58.72,7.89,425.13],[7.28,61.26,7.89,443.36],[7.32,63.09,7.89,462.24],[7.36,63.15,7.97,482.42],[7.4,64.06,7.85,502.6],[7.44,65.89,7.77,524.09],[7.48,67.84,7.81,546.22],[7.52,68.88,7.93,569.66],[7.56,69.47,7.97,593.1],[7.6,68.95,8.24,616.54],[7.64,64.19,8.52,638.02],[7.68,55.99,8.59,655.6],[7.72,46.68,8.71,667.32],[7.76,26.76,7.42,673.83],[7.8,1.5,6.09,662.11],[7.84,0.72,5.08,641.93],[7.88,15.43,3.98,624.35],[7.92,30.73,3.44,619.14],[7.96,32.75,4.38,618.49]],
  p3:[[0.0,73.44,11.56,333.33],[0.04,73.37,11.56,333.33],[0.08,73.5,11.56,333.33],[0.12,73.44,11.52,333.33],[0.16,73.24,11.52,333.33],[0.2,73.37,11.56,333.33],[0.24,73.5,11.56,333.33],[0.28,73.24,11.6,333.33],[0.32,73.31,11.64,333.33],[0.36,73.24,11.68,333.33],[0.4,73.31,11.76,333.33],[0.44,73.24,11.76,333.33],[0.48,73.18,11.84,333.33],[0.52,73.31,11.88,333.33],[0.56,73.31,11.91,333.33],[0.6,73.18,11.95,333.33],[0.64,73.24,11.91,333.33],[0.68,73.37,11.88,333.33],[0.72,73.44,11.88,333.33],[0.76,73.31,11.88,333.33],[0.8,73.31,11.88,333.33],[0.84,73.18,11.91,333.33],[0.88,73.5,11.91,333.33],[0.92,73.31,11.91,333.33],[0.96,73.44,11.91,333.33],[1.0,73.44,11.91,333.33],[1.04,73.44,11.91,333.33],[1.08,73.18,11.91,333.33],[1.12,73.24,11.95,333.33],[1.16,73.37,11.99,333.33],[1.2,73.37,11.99,333.33],[1.24,73.44,11.99,333.33],[1.28,73.24,11.99,333.33],[1.32,73.11,11.99,333.33],[1.36,73.37,11.99,333.33],[1.4,73.24,11.99,333.33],[1.44,73.31,12.03,333.33],[1.48,73.44,12.03,333.33],[1.52,73.37,11.99,333.33],[1.56,73.24,11.99,333.33],[1.6,73.57,12.03,333.33],[1.64,73.18,12.03,333.33],[1.68,73.31,12.07,333.33],[1.72,73.18,12.07,333.33],[1.76,73.18,12.11,333.33],[1.8,73.31,12.11,333.33],[1.84,73.31,12.07,333.33],[1.88,73.31,12.07,333.33],[1.92,73.37,12.07,333.33],[1.96,73.44,12.11,333.33],[2.0,73.5,12.15,333.33],[2.04,73.63,12.11,333.33],[2.08,73.18,12.11,333.33],[2.12,73.37,12.15,333.33],[2.16,73.44,12.15,333.33],[2.2,73.37,12.19,333.33],[2.24,73.24,12.15,333.33],[2.28,73.37,12.15,333.33],[2.32,73.31,12.11,333.33],[2.36,73.31,12.15,333.33],[2.4,73.44,12.11,333.33],[2.44,73.31,12.11,333.33],[2.48,73.24,12.15,333.33],[2.52,73.24,12.11,333.33],[2.56,73.37,12.11,333.33],[2.6,73.5,12.11,333.33],[2.64,73.31,12.07,333.33],[2.68,73.24,12.03,333.33],[2.72,73.44,12.03,333.33],[2.76,73.31,12.03,333.33],[2.8,73.18,11.99,333.33],[2.84,73.24,11.95,333.33],[2.88,73.37,11.88,333.33],[2.92,73.5,11.8,333.33],[2.96,73.37,11.76,333.33],[3.0,73.44,11.76,333.33],[3.04,73.24,11.8,333.33],[3.08,73.44,11.8,333.33],[3.12,73.18,11.8,333.33],[3.16,73.44,11.8,333.33],[3.2,73.18,11.88,333.33],[3.24,73.24,11.88,333.33],[3.28,73.5,11.91,333.33],[3.32,73.18,11.88,333.33],[3.36,73.37,11.84,333.33],[3.4,73.31,11.84,333.33],[3.44,73.5,11.84,333.33],[3.48,73.31,11.91,333.33],[3.52,73.37,11.91,333.33],[3.56,73.37,11.91,333.33],[3.6,73.31,11.91,333.33],[3.64,73.24,11.88,333.33],[3.68,73.05,11.91,333.33],[3.72,73.57,11.95,333.33],[3.76,73.31,11.99,333.33],[3.8,73.5,11.99,333.33],[3.84,73.5,11.99,333.33],[3.88,73.24,12.03,333.33],[3.92,73.24,11.99,333.33],[3.96,73.31,11.99,333.33],[4.0,73.5,12.03,333.33],[4.04,73.5,12.03,333.33],[4.08,73.5,11.99,333.33],[4.12,73.24,11.99,333.33],[4.16,73.37,11.99,333.33],[4.2,73.31,12.03,333.33],[4.24,73.37,12.03,333.33],[4.28,73.37,11.99,333.33],[4.32,73.31,11.95,333.33],[4.36,73.24,11.95,333.33],[4.4,73.24,11.95,333.33],[4.44,73.37,11.99,333.33],[4.48,73.31,11.95,333.33],[4.52,73.24,11.91,333.33],[4.56,73.5,11.91,333.33],[4.6,73.37,11.91,333.33],[4.64,73.5,11.91,333.33],[4.68,73.44,11.88,333.33],[4.72,73.18,11.91,333.33],[4.76,73.37,11.95,333.33],[4.8,73.37,11.95,333.33],[4.84,73.24,11.95,333.33],[4.88,73.37,11.95,333.33],[4.92,73.24,11.95,333.33],[4.96,73.24,11.91,333.33],[5.0,73.37,11.88,333.33],[5.04,73.11,11.88,333.33],[5.08,73.37,11.84,333.33],[5.12,73.57,11.84,333.33],[5.16,73.44,11.84,333.33],[5.2,73.37,11.8,333.33],[5.24,73.57,11.76,333.33],[5.28,73.44,11.72,333.33],[5.32,73.37,11.72,333.33],[5.36,73.44,11.68,333.33],[5.4,73.24,11.68,333.33],[5.44,73.18,11.64,333.33],[5.48,73.18,11.56,333.33],[5.52,73.31,11.56,333.33],[5.56,73.24,11.56,333.33],[5.6,73.18,11.52,333.33],[5.64,73.24,11.56,333.33],[5.68,73.31,11.56,333.33],[5.72,73.44,11.56,333.33],[5.76,73.37,11.56,333.33],[5.8,73.31,11.56,333.33],[5.84,73.37,11.48,333.33],[5.88,73.44,11.52,333.33],[5.92,73.37,11.48,333.33],[5.96,73.37,11.52,333.33]],
};

/* ─── PATIENT CONFIGURATIONS ─── */
const PATIENTS = [
  { id:0, key:"p1", label:"Patient A", age:47, sex:"M", dx:"ARDS", mode:"VCV",
    cond:"CRITICAL", condColor:"#ef4444", C:8, R:12,
    spo2:88, etco2:38, hr:118, bp:"105/68", temp:38.4,
    info:"Severe ARDS — low compliance, high resistance. Lung-protective strategy required.",
    baseAlarm:71, defaults:{vt:430,peep:8,fio2:80,rr:14,ie_i:1,ie_e:2}},
  { id:1, key:"p2", label:"Patient B", age:81, sex:"M", dx:"Severe Pneumonia", mode:"VCV",
    cond:"SERIOUS", condColor:"#f59e0b", C:30, R:18,
    spo2:93, etco2:42, hr:96, bp:"118/76", temp:38.0,
    info:"Elderly with bilateral pneumonia — moderate compliance, increased secretions.",
    baseAlarm:64, defaults:{vt:400,peep:6,fio2:55,rr:16,ie_i:1,ie_e:2}},
  { id:2, key:"p3", label:"Patient C", age:87, sex:"M", dx:"Post-op Resp. Failure", mode:"CPAP",
    cond:"MODERATE", condColor:"#22c55e", C:40, R:8,
    spo2:96, etco2:40, hr:82, bp:"128/82", temp:37.2,
    info:"Post-surgical — near-normal mechanics. CPAP mode, weaning assessment pending.",
    baseAlarm:58, defaults:{vt:360,peep:5,fio2:45,rr:12,ie_i:1,ie_e:2}},
];

/* ─── PHYSICS MODEL ─── */
function computeParams(C, R, { vt, peep, fio2, rr, ie_i, ie_e }) {
  const cycleT = 60 / rr;
  const ti = cycleT * ie_i / (ie_i + ie_e);
  const te = cycleT - ti;
  const flow_ls = (vt / 1000) / ti;
  const ppeak = peep + vt / C + R * flow_ls;
  const pplat = peep + vt / C;
  const dp = vt / C;
  const map = peep + (ppeak - peep) * 0.5 * (ti / cycleT);
  const mv = (vt * rr) / 1000;
  let risk = "SAFE";
  if (dp > 20 || pplat > 35) risk = "DANGER";
  else if (dp > 15 || pplat > 30) risk = "CAUTION";
  const alarmReduction = risk === "SAFE" ? 53 : risk === "CAUTION" ? 29 : 8;
  return {
    ti: ti.toFixed(2), te: te.toFixed(2),
    flow: (flow_ls * 60).toFixed(1),
    ppeak: ppeak.toFixed(1), pplat: pplat.toFixed(1),
    dp: dp.toFixed(1), map: map.toFixed(1), mv: mv.toFixed(2),
    risk, alarmReduction,
  };
}

/* ─── PREDICTED WAVEFORM (Digital Twin Physics) ─── */
function generatePrediction(C, R, { vt, peep, rr, ie_i, ie_e }) {
  const dt = 0.04;
  const cycleT = 60 / rr;
  const ti = cycleT * ie_i / (ie_i + ie_e);
  const tau = Math.max(0.15, (R * C) / 1000);
  const flow_ls = (vt / 1000) / ti;
  const pts = [];
  for (let t = 0; t <= cycleT * 3; t += dt) {
    const ph = t % cycleT;
    if (ph < ti) {
      const vol = flow_ls * ph * 1000;
      pts.push({ t: +t.toFixed(2), f: +(flow_ls * 60).toFixed(1), p: +(peep + vol/C + R*flow_ls).toFixed(1), v: +(333.33 + vol).toFixed(1) });
    } else {
      const et = ph - ti;
      const vol = vt * Math.exp(-et / tau);
      pts.push({ t: +t.toFixed(2), f: +(-vol/tau*60/1000).toFixed(1), p: +(peep + vol/C).toFixed(1), v: +(333.33 + vol).toFixed(1) });
    }
  }
  return pts;
}

/* ─── SUB-COMPONENTS ─── */
const C = { bg: "#03080f", panel: "#081220", card: "#0c1a2e", border: "#152d4a", text: "#e2e8f0", dim: "#64748b", cyan: "#00d4ff", orange: "#ff7a33", purple: "#a78bfa", green: "#10b981", amber: "#f59e0b", red: "#ef4444", teal: "#0d9488" };

function WaveChart({ data, dataKey, color, domain, unit, label, refY = 0 }) {
  const chartData = data.map(d => ({ t: d.t, v: d[dataKey] }));
  const cur = chartData.length > 0 ? chartData[chartData.length - 1].v : 0;
  return (
    <div style={{ background: C.panel, borderRadius: 8, border: `1px solid ${C.border}`, padding: "8px 0 4px", marginBottom: 8, position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "0 14px 4px" }}>
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, letterSpacing: 2, color: C.dim, textTransform: "uppercase" }}>{label}</span>
        <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 22, fontWeight: 500, color }}>{typeof cur === 'number' ? cur.toFixed(1) : cur}</span>
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: C.dim }}>{unit}</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={80}>
        <AreaChart data={chartData} margin={{ top: 2, right: 8, bottom: 2, left: 0 }}>
          <defs>
            <linearGradient id={`grad_${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.25} />
              <stop offset="95%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="2 4" stroke={C.border} vertical={false} />
          <XAxis dataKey="t" hide />
          <YAxis domain={domain} tick={{ fill: C.dim, fontSize: 9, fontFamily: "JetBrains Mono" }} width={34} tickCount={4} />
          <ReferenceLine y={refY} stroke={C.border} strokeWidth={1} />
          <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.8} fill={`url(#grad_${dataKey})`} dot={false} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function MiniChart({ data, dataKey, color, domain, label }) {
  const chartData = data.map(d => ({ t: d.t, v: d[dataKey] }));
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: C.dim, letterSpacing: 1 }}>{label}</span>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, marginTop: 2 }} />
      </div>
      <ResponsiveContainer width="100%" height={50}>
        <LineChart data={chartData} margin={{ top: 2, right: 4, bottom: 2, left: 0 }}>
          <YAxis domain={domain} hide />
          <ReferenceLine y={0} stroke={C.border} />
          <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function StatCard({ label, value, unit, color = C.text, small = false }) {
  return (
    <div style={{ background: C.card, borderRadius: 6, border: `1px solid ${C.border}`, padding: "10px 12px" }}>
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: C.dim, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: small ? 16 : 20, fontWeight: 500, color }}>{value}</span>
        {unit && <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: C.dim }}>{unit}</span>}
      </div>
    </div>
  );
}

function Slider({ label, value, min, max, step = 1, unit, onChange, warn }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: C.dim, letterSpacing: 1, textTransform: "uppercase" }}>{label}</span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: warn ? C.amber : C.cyan }}>
          {value} <span style={{ fontSize: 10, color: C.dim }}>{unit}</span>
        </span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(+e.target.value)}
        style={{ width: "100%", appearance: "none", height: 4, borderRadius: 2, background: `linear-gradient(to right, ${warn ? C.amber : C.cyan} ${pct}%, ${C.border} ${pct}%)`, cursor: "pointer", outline: "none" }} />
    </div>
  );
}

function RiskBadge({ risk }) {
  const map = { SAFE: [C.green, "✓ SAFE — ไม่มีความเสี่ยง VILI"], CAUTION: [C.amber, "⚠ CAUTION — เฝ้าระวัง"], DANGER: [C.red, "✕ DANGER — ความเสี่ยงสูง"] };
  const [col, text] = map[risk] || map.SAFE;
  return (
    <div style={{ background: col + "18", border: `1px solid ${col}40`, borderRadius: 6, padding: "8px 12px", display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: col, boxShadow: `0 0 8px ${col}` }} />
      <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, color: col, letterSpacing: 1 }}>{text}</span>
    </div>
  );
}

/* ─── MAIN APP ─── */
export default function VentilatorDigitalTwin() {
  const [pid, setPid] = useState(0);
  const [cursor, setCursor] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [settings, setSettings] = useState(PATIENTS[0].defaults);
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("monitor");
  const timerRef = useRef(null);

  const patient = PATIENTS[pid];
  const raw = RAW[patient.key];
  const WINDOW = 80;

  useEffect(() => {
    clearInterval(timerRef.current);
    if (playing) timerRef.current = setInterval(() => setCursor(c => (c + 1) % raw.length), 22);
    return () => clearInterval(timerRef.current);
  }, [playing, raw]);

  useEffect(() => {
    setCursor(0);
    setSettings(PATIENTS[pid].defaults);
    setAiText("");
  }, [pid]);

  const setSetting = (key, val) => setSettings(s => ({ ...s, [key]: val }));

  const displayData = useMemo(() => {
    const start = Math.max(0, cursor - WINDOW);
    return raw.slice(start, cursor + 1).map(([t, f, p, v]) => ({ t, f, p, v }));
  }, [cursor, raw]);

  const cur = displayData.length > 0 ? displayData[displayData.length - 1] : { f: 0, p: 0, v: 0 };
  const computed = useMemo(() => computeParams(patient.C, patient.R, settings), [patient, settings]);
  const predicted = useMemo(() => generatePrediction(patient.C, patient.R, settings), [patient, settings]);

  const riskColor = { SAFE: C.green, CAUTION: C.amber, DANGER: C.red }[computed.risk];
  const optimizedAlarm = Math.max(5, patient.baseAlarm - computed.alarmReduction);

  const getAI = async () => {
    setAiLoading(true);
    setAiText("");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `คุณเป็น AI ผู้ช่วยแพทย์เวชบำบัดวิกฤตใน Ventilator Digital Twin System ตอบเป็นภาษาไทยผสมคำศัพท์การแพทย์ภาษาอังกฤษ

ข้อมูลผู้ป่วย: อายุ ${patient.age} ปี เพศ ${patient.sex} — ${patient.dx} (${patient.cond})
Lung Mechanics: Compliance = ${patient.C} mL/cmH₂O, Resistance = ${patient.R} cmH₂O/L/s

การตั้งค่าเครื่องช่วยหายใจปัจจุบัน:
- Tidal Volume (Vt): ${settings.vt} mL (≈ ${(settings.vt/70).toFixed(1)} mL/kg IBW)
- PEEP: ${settings.peep} cmH₂O
- FiO₂: ${settings.fio2}%
- Respiratory Rate (RR): ${settings.rr} ครั้ง/นาที
- I:E Ratio: 1:${settings.ie_e}

Digital Twin Prediction:
- Ppeak: ${computed.ppeak} cmH₂O | Pplat: ${computed.pplat} cmH₂O
- Driving Pressure (ΔP): ${computed.dp} cmH₂O
- Mean Airway Pressure: ${computed.map} cmH₂O
- Minute Ventilation: ${computed.mv} L/min
- ระดับความเสี่ยง VILI: ${computed.risk}

กรุณาให้คำแนะนำทางคลินิก 4 ข้อ เพื่อ optimize การตั้งค่า พร้อมอธิบายเหตุผลและผลที่คาดหวัง ให้กระชับและตรงประเด็น`
          }]
        }),
      });
      const data = await res.json();
      setAiText(data.content?.[0]?.text || "ไม่ได้รับข้อมูล");
    } catch (e) {
      setAiText("ข้อผิดพลาด: " + e.message);
    }
    setAiLoading(false);
  };

  const tabStyle = (t) => ({
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 12, letterSpacing: 2, textTransform: "uppercase",
    padding: "6px 16px", cursor: "pointer", borderRadius: 4,
    background: activeTab === t ? C.cyan + "20" : "transparent",
    color: activeTab === t ? C.cyan : C.dim,
    border: activeTab === t ? `1px solid ${C.cyan}40` : "1px solid transparent",
    transition: "all 0.2s",
  });

  return (
    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", background: C.bg, minHeight: "100vh", color: C.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input[type=range] { accent-color: #00d4ff; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #152d4a; border-radius: 4px; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes scanline { 0%{left:-100%} 100%{left:100%} }
      `}</style>

      {/* ── HEADER ── */}
      <header style={{ background: C.panel, borderBottom: `1px solid ${C.border}`, padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${C.cyan}, ${C.teal})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🫁</div>
          <div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 16, letterSpacing: 3, color: C.cyan }}>VENTILATOR DIGITAL TWIN</div>
            <div style={{ fontSize: 10, color: C.dim, letterSpacing: 2 }}>BDI HACKATHON 2026 · TRACK HEALTH · ICU AI PLATFORM</div>
          </div>
        </div>
        {/* Patient Selector */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {PATIENTS.map((p, i) => (
            <button key={p.id} onClick={() => setPid(i)} style={{
              background: pid === i ? p.condColor + "22" : C.card,
              border: `1px solid ${pid === i ? p.condColor : C.border}`,
              borderRadius: 8, padding: "6px 14px", cursor: "pointer", transition: "all 0.2s"
            }}>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700, color: pid === i ? p.condColor : C.text, letterSpacing: 1 }}>{p.label}</div>
              <div style={{ fontSize: 10, color: C.dim }}>{p.age}y {p.sex} · {p.dx}</div>
            </button>
          ))}
        </div>
        {/* Live indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: playing ? C.green : C.dim, animation: playing ? "pulse 1.5s infinite" : "none" }} />
          <span style={{ fontSize: 10, color: C.dim, letterSpacing: 2 }}>{playing ? "LIVE" : "PAUSED"}</span>
          <button onClick={() => setPlaying(p => !p)} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 4, padding: "4px 10px", cursor: "pointer", fontSize: 10, color: C.text, letterSpacing: 1 }}>{playing ? "⏸ PAUSE" : "▶ PLAY"}</button>
        </div>
      </header>

      {/* ── MAIN LAYOUT ── */}
      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr 360px", gap: 0, height: "calc(100vh - 60px)" }}>

        {/* ── LEFT PANEL: Patient Info ── */}
        <div style={{ background: C.panel, borderRight: `1px solid ${C.border}`, padding: 14, overflowY: "auto" }}>
          {/* Patient Card */}
          <div style={{ background: patient.condColor + "18", border: `1px solid ${patient.condColor}40`, borderRadius: 10, padding: 14, marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 18, letterSpacing: 1 }}>{patient.label}</div>
                <div style={{ fontSize: 11, color: C.dim }}>{patient.age} years old · {patient.sex} · {patient.mode}</div>
              </div>
              <div style={{ background: patient.condColor, color: "#fff", borderRadius: 4, padding: "2px 8px", fontSize: 9, fontWeight: 700, letterSpacing: 2 }}>{patient.cond}</div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: patient.condColor, marginBottom: 4 }}>{patient.dx}</div>
            <div style={{ fontSize: 10, color: C.dim, lineHeight: 1.5 }}>{patient.info}</div>
          </div>

          {/* Vitals Grid */}
          <div style={{ fontSize: 10, color: C.dim, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>VITAL SIGNS</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 14 }}>
            <StatCard label="SpO₂" value={patient.spo2} unit="%" color={patient.spo2 < 90 ? C.red : patient.spo2 < 94 ? C.amber : C.green} />
            <StatCard label="HR" value={patient.hr} unit="bpm" color={patient.hr > 100 ? C.amber : C.text} />
            <StatCard label="EtCO₂" value={patient.etco2} unit="mmHg" small />
            <StatCard label="Temp" value={patient.temp} unit="°C" color={patient.temp > 38 ? C.amber : C.text} small />
          </div>
          <div style={{ marginBottom: 14 }}>
            <StatCard label="Blood Pressure" value={patient.bp} unit="mmHg" small />
          </div>

          {/* Lung Mechanics */}
          <div style={{ fontSize: 10, color: C.dim, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>LUNG MECHANICS</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 14 }}>
            <StatCard label="Compliance" value={patient.C} unit="mL/cmH₂O" color={patient.C < 15 ? C.red : patient.C < 30 ? C.amber : C.green} small />
            <StatCard label="Resistance" value={patient.R} unit="cmH₂O/L/s" color={patient.R > 15 ? C.amber : C.text} small />
          </div>

          {/* Alarm Meter */}
          <div style={{ fontSize: 10, color: C.dim, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>FALSE ALARM RATE</div>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: 12, marginBottom: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 10, color: C.dim }}>Current</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: C.red }}>{patient.baseAlarm}%</span>
            </div>
            <div style={{ height: 6, background: C.border, borderRadius: 3, marginBottom: 8 }}>
              <div style={{ height: "100%", width: `${patient.baseAlarm}%`, background: C.red, borderRadius: 3 }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 10, color: C.dim }}>With Digital Twin</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: C.green }}>{optimizedAlarm}%</span>
            </div>
            <div style={{ height: 6, background: C.border, borderRadius: 3 }}>
              <div style={{ height: "100%", width: `${optimizedAlarm}%`, background: C.green, borderRadius: 3, transition: "width 0.5s ease" }} />
            </div>
            <div style={{ fontSize: 10, color: C.green, marginTop: 6, textAlign: "right" }}>
              ↓ Reduced {computed.alarmReduction}% alarm fatigue
            </div>
          </div>
        </div>

        {/* ── CENTER: Live Waveforms ── */}
        <div style={{ padding: "14px 12px", overflowY: "auto", background: C.bg }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 10, color: C.dim, letterSpacing: 2, textTransform: "uppercase" }}>
              REAL-TIME VENTILATOR WAVEFORMS · {patient.label} · t = {cur.t?.toFixed(2) ?? "0.00"} s
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: C.dim }}>
              {new Date().toLocaleTimeString("th-TH")}
            </div>
          </div>

          <WaveChart data={displayData} dataKey="f" color={C.cyan}    domain={[-80, 110]} unit="L/min"  label="FLOW"     refY={0} />
          <WaveChart data={displayData} dataKey="p" color={C.orange}  domain={[0, 70]}   unit="cmH₂O" label="PRESSURE" refY={patient.defaults.peep} />
          <WaveChart data={displayData} dataKey="v" color={C.purple}  domain={[280, 950]} unit="mL"    label="VOLUME"   refY={0} />

          {/* Current Readings Row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginTop: 8 }}>
            <StatCard label="Peak Flow" value={cur.f?.toFixed(1) ?? "—"} unit="L/min" color={C.cyan} small />
            <StatCard label="Peak Pressure" value={cur.p?.toFixed(1) ?? "—"} unit="cmH₂O" color={cur.p > 40 ? C.red : cur.p > 30 ? C.amber : C.orange} small />
            <StatCard label="Tidal Volume" value={cur.v != null ? (cur.v - 333.33).toFixed(0) : "—"} unit="mL" color={C.purple} small />
            <StatCard label="Breathing" value={`${settings.rr}`} unit="br/min" color={C.text} small />
          </div>
        </div>

        {/* ── RIGHT PANEL: Simulator ── */}
        <div style={{ background: C.panel, borderLeft: `1px solid ${C.border}`, display: "flex", flexDirection: "column", overflowY: "auto" }}>
          {/* Tabs */}
          <div style={{ display: "flex", gap: 6, padding: "10px 14px", borderBottom: `1px solid ${C.border}` }}>
            <button onClick={() => setActiveTab("monitor")} style={tabStyle("monitor")}>Monitor</button>
            <button onClick={() => setActiveTab("simulator")} style={tabStyle("simulator")}>Digital Twin</button>
            <button onClick={() => setActiveTab("ai")} style={tabStyle("ai")}>AI Assist</button>
          </div>

          <div style={{ padding: 14, flex: 1 }}>
            {/* ─ MONITOR TAB ─ */}
            {activeTab === "monitor" && (
              <div style={{ animation: "fadeIn 0.3s ease" }}>
                <div style={{ fontSize: 10, color: C.dim, letterSpacing: 2, marginBottom: 10 }}>CURRENT VENTILATOR SETTINGS</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 14 }}>
                  <StatCard label="Tidal Volume" value={settings.vt} unit="mL" color={C.cyan} />
                  <StatCard label="PEEP" value={settings.peep} unit="cmH₂O" />
                  <StatCard label="FiO₂" value={settings.fio2} unit="%" color={settings.fio2 > 70 ? C.amber : C.green} />
                  <StatCard label="Rate" value={settings.rr} unit="/min" />
                  <StatCard label="I:E Ratio" value={`1:${settings.ie_e}`} unit="" small />
                  <StatCard label="Mode" value={patient.mode} unit="" small />
                </div>

                <div style={{ fontSize: 10, color: C.dim, letterSpacing: 2, marginBottom: 10 }}>DERIVED PARAMETERS</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 14 }}>
                  <StatCard label="Ppeak (calc)" value={computed.ppeak} unit="cmH₂O" color={+computed.ppeak > 40 ? C.red : +computed.ppeak > 30 ? C.amber : C.text} small />
                  <StatCard label="Pplat (calc)" value={computed.pplat} unit="cmH₂O" color={+computed.pplat > 30 ? C.amber : C.text} small />
                  <StatCard label="Driving ΔP" value={computed.dp} unit="cmH₂O" color={+computed.dp > 15 ? C.red : C.text} small />
                  <StatCard label="MAP" value={computed.map} unit="cmH₂O" small />
                  <StatCard label="Minute Vent." value={computed.mv} unit="L/min" small />
                  <StatCard label="Insp. Time" value={computed.ti} unit="s" small />
                </div>

                <RiskBadge risk={computed.risk} />

                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: 12 }}>
                  <div style={{ fontSize: 10, color: C.dim, letterSpacing: 2, marginBottom: 8 }}>VILI RISK THRESHOLDS</div>
                  {[
                    { label: "Driving Pressure", val: computed.dp, threshold: "≤ 15", limit: 20, unit: "cmH₂O" },
                    { label: "Plateau Pressure", val: computed.pplat, threshold: "≤ 30", limit: 35, unit: "cmH₂O" },
                    { label: "Tidal Volume/IBW", val: (settings.vt/70).toFixed(1), threshold: "≤ 8", limit: 10, unit: "mL/kg" },
                  ].map(r => {
                    const ratio = Math.min(parseFloat(r.val) / r.limit, 1);
                    const col = ratio > 0.9 ? C.red : ratio > 0.7 ? C.amber : C.green;
                    return (
                      <div key={r.label} style={{ marginBottom: 8 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                          <span style={{ fontSize: 10, color: C.dim }}>{r.label}</span>
                          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: col }}>{r.val} {r.unit}</span>
                        </div>
                        <div style={{ height: 4, background: C.border, borderRadius: 2 }}>
                          <div style={{ height: "100%", width: `${ratio*100}%`, background: col, borderRadius: 2, transition: "all 0.4s" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ─ SIMULATOR TAB ─ */}
            {activeTab === "simulator" && (
              <div style={{ animation: "fadeIn 0.3s ease" }}>
                <div style={{ fontSize: 10, color: C.cyan, letterSpacing: 2, marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                  <span>⟳</span> DIGITAL TWIN SIMULATOR
                </div>
                <div style={{ fontSize: 10, color: C.dim, marginBottom: 14, lineHeight: 1.5 }}>
                  ปรับค่าด้านล่างเพื่อดูผลลัพธ์ที่ทำนายล่วงหน้าก่อนนำไปใช้กับผู้ป่วยจริง
                </div>

                <Slider label="Tidal Volume" value={settings.vt} min={200} max={800} step={10} unit="mL" warn={settings.vt > 560} onChange={v => setSetting("vt", v)} />
                <Slider label="PEEP" value={settings.peep} min={0} max={20} unit="cmH₂O" warn={settings.peep > 15} onChange={v => setSetting("peep", v)} />
                <Slider label="FiO₂" value={settings.fio2} min={21} max={100} unit="%" warn={settings.fio2 > 70} onChange={v => setSetting("fio2", v)} />
                <Slider label="Resp. Rate" value={settings.rr} min={6} max={35} unit="br/min" onChange={v => setSetting("rr", v)} />
                <Slider label="I:E (E)" value={settings.ie_e} min={1} max={4} unit={`(1:${settings.ie_e})`} onChange={v => setSetting("ie_e", v)} />

                <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 12, marginBottom: 12 }}>
                  <div style={{ fontSize: 10, color: C.dim, letterSpacing: 2, marginBottom: 8 }}>PREDICTED OUTCOMES</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 10 }}>
                    {[
                      { l: "Ppeak", v: computed.ppeak, u: "cmH₂O", c: +computed.ppeak > 40 ? C.red : +computed.ppeak > 30 ? C.amber : C.text },
                      { l: "Pplat", v: computed.pplat, u: "cmH₂O", c: +computed.pplat > 30 ? C.amber : C.text },
                      { l: "ΔP drive", v: computed.dp, u: "cmH₂O", c: +computed.dp > 15 ? C.red : +computed.dp > 12 ? C.amber : C.green },
                      { l: "MAP", v: computed.map, u: "cmH₂O", c: C.text },
                      { l: "MV", v: computed.mv, u: "L/min", c: C.text },
                      { l: "Flow", v: computed.flow, u: "L/min", c: C.cyan },
                    ].map(x => (
                      <div key={x.l} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 8px" }}>
                        <div style={{ fontSize: 9, color: C.dim, letterSpacing: 1 }}>{x.l}</div>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: x.c }}>{x.v}</div>
                        <div style={{ fontSize: 9, color: C.dim }}>{x.u}</div>
                      </div>
                    ))}
                  </div>
                  <RiskBadge risk={computed.risk} />
                </div>

                {/* Predicted Waveforms */}
                <div style={{ fontSize: 10, color: C.dim, letterSpacing: 2, marginBottom: 8 }}>PREDICTED WAVEFORMS (Digital Twin)</div>
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 0" }}>
                  <MiniChart data={predicted} dataKey="f" color={C.cyan}   domain={[-80, 120]} label="Flow (L/min)" />
                  <MiniChart data={predicted} dataKey="p" color={C.orange} domain={[0, 70]}   label="Pressure (cmH₂O)" />
                  <MiniChart data={predicted} dataKey="v" color={C.purple} domain={[280, 950]} label="Volume (mL)" />
                </div>
              </div>
            )}

            {/* ─ AI TAB ─ */}
            {activeTab === "ai" && (
              <div style={{ animation: "fadeIn 0.3s ease" }}>
                <div style={{ fontSize: 10, color: C.cyan, letterSpacing: 2, marginBottom: 4 }}>🤖 AI CLINICAL RECOMMENDATION</div>
                <div style={{ fontSize: 10, color: C.dim, marginBottom: 14, lineHeight: 1.5 }}>
                  AI ชั้นที่ 1+2 ทำงานร่วมกับ Digital Twin เพื่อให้คำแนะนำเฉพาะบุคคล (Personalized Suggestion)
                </div>

                {/* Patient + Settings Summary */}
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: 12, marginBottom: 12 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, fontSize: 10 }}>
                    <div><span style={{ color: C.dim }}>Patient: </span><span style={{ color: C.text }}>{patient.label} · {patient.age}y</span></div>
                    <div><span style={{ color: C.dim }}>Dx: </span><span style={{ color: patient.condColor }}>{patient.dx}</span></div>
                    <div><span style={{ color: C.dim }}>Compliance: </span><span style={{ fontFamily: "'JetBrains Mono', monospace", color: patient.C < 15 ? C.red : C.text }}>{patient.C} mL/cmH₂O</span></div>
                    <div><span style={{ color: C.dim }}>Resistance: </span><span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{patient.R} cmH₂O/L/s</span></div>
                    <div><span style={{ color: C.dim }}>Vt: </span><span style={{ fontFamily: "'JetBrains Mono', monospace", color: C.cyan }}>{settings.vt} mL</span></div>
                    <div><span style={{ color: C.dim }}>Ppeak: </span><span style={{ fontFamily: "'JetBrains Mono', monospace", color: +computed.ppeak > 40 ? C.red : C.orange }}>{computed.ppeak} cmH₂O</span></div>
                    <div><span style={{ color: C.dim }}>ΔP: </span><span style={{ fontFamily: "'JetBrains Mono', monospace", color: +computed.dp > 15 ? C.red : C.green }}>{computed.dp} cmH₂O</span></div>
                    <div><span style={{ color: C.dim }}>Risk: </span><span style={{ color: riskColor, fontWeight: 700 }}>{computed.risk}</span></div>
                  </div>
                </div>

                <button onClick={getAI} disabled={aiLoading} style={{
                  width: "100%", padding: "12px 0", background: aiLoading ? C.card : `linear-gradient(135deg, ${C.cyan}30, ${C.teal}20)`,
                  border: `1px solid ${C.cyan}60`, borderRadius: 8, cursor: aiLoading ? "not-allowed" : "pointer",
                  color: C.cyan, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, letterSpacing: 2, textTransform: "uppercase",
                  marginBottom: 14, transition: "all 0.2s",
                }}>
                  {aiLoading ? "⟳ กำลังประมวลผล AI..." : "✦ GET AI RECOMMENDATION"}
                </button>

                {aiText && (
                  <div style={{ background: C.card, border: `1px solid ${C.cyan}30`, borderRadius: 8, padding: 14, animation: "fadeIn 0.4s ease" }}>
                    <div style={{ fontSize: 9, color: C.cyan, letterSpacing: 2, marginBottom: 10 }}>AI CLINICAL ANALYSIS · {patient.label}</div>
                    <div style={{ fontSize: 11, lineHeight: 1.8, color: C.text, whiteSpace: "pre-wrap" }}>{aiText}</div>
                  </div>
                )}
                {!aiText && !aiLoading && (
                  <div style={{ textAlign: "center", padding: 20, color: C.dim, fontSize: 11 }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>🤖</div>
                    คลิก GET AI RECOMMENDATION เพื่อรับคำแนะนำทางคลินิกเฉพาะบุคคล<br/>
                    <span style={{ fontSize: 9, color: C.border, marginTop: 6, display: "block" }}>Powered by Claude AI · Personalized for {patient.label}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{ borderTop: `1px solid ${C.border}`, padding: "8px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 9, color: C.dim, letterSpacing: 1 }}>BDI Hackathon 2026 · Ventilator Digital Twin · Track Health</span>
            <div style={{ display: "flex", gap: 4 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.green }} />
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.cyan, animation: "pulse 2s infinite" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
