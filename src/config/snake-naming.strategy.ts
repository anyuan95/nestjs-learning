import { DefaultNamingStrategy } from 'typeorm';

/**
 * 下划线命名策略
 * 将驼峰命名转换为下划线命名（例如：userId -> user_id, createdAt -> created_at）
 */
export class SnakeNamingStrategy extends DefaultNamingStrategy {
  /**
   * 将驼峰命名转换为下划线命名
   * @param propertyName 属性名（驼峰格式）
   * @param customName 自定义列名（如果 @Column 装饰器指定了 name）
   * @param embeddedPrefixes 嵌入式前缀数组
   * @returns 数据库列名（下划线格式）
   */
  columnName(propertyName: string, customName?: string, embeddedPrefixes?: string[]): string {
    // 如果已经指定了自定义列名，则使用自定义列名
    if (customName) {
      return customName;
    }
    // 处理嵌入式前缀
    const name = embeddedPrefixes ? embeddedPrefixes.concat(propertyName).join('_') : propertyName;
    // 将驼峰命名转换为下划线命名
    return name.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
  }

  /**
   * 关系列名（外键列名）转换为下划线格式
   * @param propertyName 属性名
   * @returns 下划线格式的关系列名
   */
  relationName(propertyName: string): string {
    return propertyName.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
  }

  /**
   * 连接表列名转换为下划线格式
   * @param tableName 表名
   * @param propertyName 属性名
   * @param columnName 列名
   * @returns 下划线格式的连接表列名
   */
  joinTableColumnName(tableName: string, propertyName: string, columnName?: string): string {
    if (columnName) {
      return columnName;
    }
    const name = `${tableName}_${propertyName}`;
    return name.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
  }
}

